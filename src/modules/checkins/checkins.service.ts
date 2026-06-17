import { DateTime } from "luxon";
import { teamRepository } from "../../repositories/team.repository";
import { checkinRepository } from "../../repositories/checkin.repository";
import { teamMemberRepository } from "../../repositories/teamMember.repository";
import { checkinResponseRepository } from "./../../repositories/checkinResponse.repository";
import { notificationLogRepository } from "./../../repositories/notificationLog.repository";
import { userRepository } from "../../repositories/user.repository";
import { Checkin, CHECKIN_STATUS } from "../../types/checkin.types";
import { USER_STATUS } from "../../types/user.types";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
} from "../../types/notificationLog.types";
import { slackService } from "../../infrastructure/slack/slack.service";
import { Team } from "../../types/team.types";
import { googleSheetsService } from "../../infrastructure/google/googleSheets.service";
import {
  DAILY_STATUS,
  DailyStatusRow,
} from "../../infrastructure/google/googleShets.types";

type CreateDailyCheckinsResult = {
  totalTeams: number;
  created: number;
  skipped: number;
  failed: number;
};

class CheckinsService {
  private async createDailyReportRows(
    checkin: Checkin,
    team: Team,
  ): Promise<DailyStatusRow[]> {
    const members = await teamMemberRepository.findActiveByTeamId(team.id);

    const rows: DailyStatusRow[] = [];

    for (const member of members) {
      const user = member.user;

      if (!user) continue;
      if (user.status !== USER_STATUS.ACTIVE) continue;

      rows.push([
        checkin.date,
        team.name,
        user.name,
        user.email,
        user.language,
        DAILY_STATUS.NO_RESPONSE,
        "",
        false,
        "",
        checkin.id,
        user.id,
      ]);
    }
    return rows;
  }

  async createDailyCheckins(): Promise<CreateDailyCheckinsResult> {
    const teams = await teamRepository.findActive();

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const team of teams) {
      try {
        const now = DateTime.now().setZone(team.timezone);
        const localDate = now.toISODate();

        if (!localDate) {
          throw new Error(`Invalid local date for timezone: ${team.timezone}`);
        }

        const existingCheckin = await checkinRepository.findByTeamAndDate(
          team.id,
          localDate,
        );

        if (existingCheckin) {
          skipped++;
          continue;
        }

        const [hour, minute] = team.check_in_time.split(":");

        const scheduledAt = DateTime.fromISO(localDate, {
          zone: team.timezone,
        }).set({
          hour: Number(hour),
          minute: Number(minute),
          second: 0,
          millisecond: 0,
        });

        const reminderScheduledAt = scheduledAt.plus({
          hours: team.reminder_delay_hours,
        });

        const scheduledAtIso = scheduledAt.toISO();
        const reminderScheduledAtIso = reminderScheduledAt.toISO();

        if (!scheduledAtIso || !reminderScheduledAtIso) {
          throw new Error(`Invalid check-in schedule for team: ${team.name}`);
        }

        const checkin = await checkinRepository.create({
          team_id: team.id,
          date: localDate,
          scheduled_at: scheduledAtIso,
          reminder_scheduled_at: reminderScheduledAtIso,
          status: CHECKIN_STATUS.CREATED,
        });

        const rows = await this.createDailyReportRows(checkin, team);

        if (rows.length > 0) {
          await googleSheetsService.appendDailyStatusRows(rows);
        }

        created++;
      } catch (error) {
        failed++;
        console.error(
          `Failed to create daily check-in for team ${team.name}:`,
          error,
        );
        continue;
      }
    }

    return {
      totalTeams: teams.length,
      created,
      skipped,
      failed,
    };
  }

  async dispatchCreatedCheckins() {
    const checkins = await checkinRepository.findCreated();

    for (const checkin of checkins) {
      const members = await teamMemberRepository.findActiveByTeamId(
        checkin.team_id,
      );

      let sentCount = 0;
      let failedCount = 0;

      for (const member of members) {
        const user = member.user;

        if (!user) {
          continue;
        }

        if (user.status !== USER_STATUS.ACTIVE) {
          continue;
        }

        if (!user.slack_user_id) {
          continue;
        }

        const existingLog =
          await notificationLogRepository.findByCheckinAndUserAndType(
            checkin.id,
            user.id,
            NOTIFICATION_TYPE.CHECK_IN,
          );

        if (existingLog) {
          continue;
        }

        try {
          // Send Checkin message
          const slackMessage = await slackService.sendCheckinMessage({
            slackUserId: user.slack_user_id,
            checkinId: checkin.id,
            language: user.language,
          });

          sentCount++;

          await notificationLogRepository.create({
            checkin_id: checkin.id,
            user_id: user.id,
            channel: NOTIFICATION_CHANNEL.SLACK,
            type: NOTIFICATION_TYPE.CHECK_IN,
            status: NOTIFICATION_STATUS.SENT,
            slack_channel_id: slackMessage.channelId,
            slack_message_ts: slackMessage.messageTs,
            sent_at: new Date().toISOString(),
            error_message: undefined,
          });
        } catch (error) {
          failedCount++;

          const errorMessage =
            error instanceof Error ? error.message : "Unknown Slack error";

          await notificationLogRepository.create({
            checkin_id: checkin.id,
            user_id: user.id,
            channel: NOTIFICATION_CHANNEL.SLACK,
            type: NOTIFICATION_TYPE.CHECK_IN,
            status: NOTIFICATION_STATUS.FAILED,
            slack_channel_id: undefined,
            slack_message_ts: undefined,
            sent_at: undefined,
            error_message: errorMessage,
          });
        }
      }

      if (sentCount > 0) {
        await checkinRepository.update(checkin.id, {
          status: CHECKIN_STATUS.SENT,
          sent_at: new Date().toISOString(),
        });
      } else {
        await checkinRepository.update(checkin.id, {
          status: CHECKIN_STATUS.FAILED,
        });
      }
    }
  }

  async processSafeResponse(
    slackId: string,
    checkinId: string,
    channelId: string,
    messageTs: string,
  ) {
    const user = await userRepository.findBySlackUserId(slackId);
    const checkin = await checkinRepository.findById(checkinId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new Error("User is not active");
    }

    if (!checkin) {
      throw new Error("Checkin not found");
    }

    const checkinResponse =
      await checkinResponseRepository.findByCheckinAndUser(checkinId, user.id);

    if (!checkinResponse) {
      const checkinResponsePayload = {
        checkin_id: checkinId,
        user_id: user.id,
      };

      await checkinResponseRepository.create(checkinResponsePayload);
    }
  }
}

export const checkinsService = new CheckinsService();
