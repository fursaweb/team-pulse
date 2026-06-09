import { DateTime } from "luxon";
import { teamRepository } from "../../repositories/team.repository";
import { checkinRepository } from "../../repositories/checkin.repository";
import { CHECKIN_STATUS } from "../../types/checkin.types";

type CreateDailyCheckinsResult = {
  totalTeams: number;
  created: number;
  skipped: number;
  failed: number;
};

class CheckinsService {
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

        await checkinRepository.create({
          team_id: team.id,
          date: localDate,
          scheduled_at: scheduledAtIso,
          reminder_scheduled_at: reminderScheduledAtIso,
          status: CHECKIN_STATUS.CREATED,
        });

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

    console.log({ totalTeams: teams.length, created, skipped, failed });

    return {
      totalTeams: teams.length,
      created,
      skipped,
      failed,
    };
  }
}

export const checkinsService = new CheckinsService();
