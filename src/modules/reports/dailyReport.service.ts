import { DateTime } from "luxon";
import { teamMemberRepository } from "./../../repositories/teamMember.repository";
import { checkinRepository } from "../../repositories/checkin.repository";
import { teamRepository } from "../../repositories/team.repository";
import { Team } from "../../types/team.types";
import {
  DailyReport,
  DailyReportTotals,
  NonResponder,
  REPORT_STATUS,
  TeamReport,
} from "./dailyReport.types";
import { USER_STATUS } from "../../types/user.types";
import { checkinResponseRepository } from "../../repositories/checkinResponse.repository";
import { logger } from "../../infrastructure/logger/logger";
import { CHECKIN_STATUS } from "../../types/checkin.types";

class DailyReportService {
  private async buildTeamReport(team: Team, date: string): Promise<TeamReport> {
    const checkin = await checkinRepository.findByTeamAndDate(team.id, date);

    const activeMembers = await teamMemberRepository.findActiveByTeamId(
      team.id,
    );

    const activeMemberships = activeMembers.filter(
      (member) => member.user && member.user.status === USER_STATUS.ACTIVE,
    );

    const totalMembers = activeMemberships.length;

    if (!checkin) {
      return {
        teamId: team.id,
        teamName: team.name,
        status: REPORT_STATUS.CHECKIN_NOT_CREATED,
        checkinId: null,
        totalMembers,
        respondedCount: 0,
        nonResponderCount: 0,
        nonResponders: [],
      };
    }

    if (checkin.status === CHECKIN_STATUS.FAILED) {
      return {
        teamId: team.id,
        teamName: team.name,
        status: REPORT_STATUS.CHECKIN_FAILED,
        checkinId: checkin.id,
        totalMembers,
        respondedCount: 0,
        nonResponderCount: 0,
        nonResponders: [],
      };
    }

    const checkinResponses = await checkinResponseRepository.findByCheckinId(
      checkin.id,
    );

    const responderIds = new Set(
      checkinResponses.map((response) => response.user_id),
    );

    const nonResponders: NonResponder[] = [];

    for (let member of activeMemberships) {
      if (!responderIds.has(member.user_id)) {
        nonResponders.push({
          userId: member.user_id,
          name: member.user.name,
          email: member.user.email,
        });
      }
    }

    const respondedCount = activeMemberships.filter((member) =>
      responderIds.has(member.user_id),
    ).length;

    const nonResponderCount = nonResponders.length;
    return {
      teamId: team.id,
      teamName: team.name,
      status:
        nonResponders.length === 0
          ? REPORT_STATUS.ALL_RESPONDED
          : REPORT_STATUS.HAS_NON_RESPONDERS,
      checkinId: checkin.id,
      totalMembers,
      respondedCount,
      nonResponderCount,
      nonResponders,
    };
  }

  private calculateReportTotals(teamReports: TeamReport[]): DailyReportTotals {
    let totalMembers = 0;
    let respondedCount = 0;
    let nonResponderCount = 0;
    let teamsWithoutCheckinCount = 0;
    let failedCheckinCount = 0;

    for (let teamReport of teamReports) {
      totalMembers += teamReport.totalMembers;
      respondedCount += teamReport.respondedCount;
      nonResponderCount += teamReport.nonResponderCount;

      if (teamReport.status === REPORT_STATUS.CHECKIN_NOT_CREATED) {
        teamsWithoutCheckinCount++;
      }

      if (teamReport.status === REPORT_STATUS.CHECKIN_FAILED) {
        failedCheckinCount++;
      }
    }

    return {
      totalTeams: teamReports.length,
      totalMembers,
      respondedCount,
      nonResponderCount,
      teamsWithoutCheckinCount,
      failedCheckinCount,
    };
  }

  async buildDailyReport(date: string): Promise<DailyReport> {
    const activeTeams = await teamRepository.findActive();

    const teamReportPromises = activeTeams.map((team) =>
      this.buildTeamReport(team, date),
    );

    const teamReports = await Promise.all(teamReportPromises);

    const totals = this.calculateReportTotals(teamReports);

    return {
      reportDate: date,
      generatedAt: DateTime.now().toISO(),
      teams: teamReports,
      totals,
    };
  }
}

export const dailyReportService = new DailyReportService();
