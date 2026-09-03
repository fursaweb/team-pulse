import { googleSheetsService } from "../../infrastructure/google/googleSheets.service";
import {
  SyncErrorData,
  TeamSheetRow,
  UserSheetRow,
} from "../../infrastructure/google/googleShets.types";
import { logger } from "../../infrastructure/logger/logger";
import { teamRepository } from "../../repositories/team.repository";
import { teamMemberRepository } from "../../repositories/teamMember.repository";
import { userRepository } from "../../repositories/user.repository";
import { Team } from "../../types/team.types";
import { TEAM_MEMBER_ROLE, TeamMember } from "../../types/teamMember.type";
import { LANG, User, USER_STATUS } from "../../types/user.types";
import { parseStaffRows } from "./staff.parser";
import { StaffRow } from "./staff.schema";

class StaffSyncService {
  private isSyncing = false;

  private async syncTeams(validRows: StaffRow[]): Promise<Map<string, Team>> {
    logger.info("StaffSyncService", "syncTeams started");

    const teamRows = await googleSheetsService.readTeamsSheet();
    const teamsFromSheet = new Set<string>();

    for (let row of teamRows) {
      teamsFromSheet.add(row[0]);
    }

    const allTeams = await teamRepository.findAll();

    const teamsByName: Map<string, Team> = new Map();

    allTeams.forEach((team) => {
      teamsByName.set(team.name, team);
    });

    const teamNames = validRows
      .map((row) => row.teamName)
      .filter((teamName): teamName is string => Boolean(teamName));

    const uniqueTeamNames = Array.from(new Set(teamNames));

    const teamsToAppend: TeamSheetRow[] = [];

    for (const teamName of uniqueTeamNames) {
      let team: Team;
      const existingTeam = teamsByName.get(teamName);

      if (existingTeam) {
        team = existingTeam;
      } else {
        team = await teamRepository.create({
          name: teamName,
          timezone: "Europe/Kyiv",
          check_in_time: "10:00",
          reminder_delay_hours: 1,
          active: false,
        });
        teamsByName.set(team.name, team);
      }

      if (!teamsFromSheet.has(team.name)) {
        teamsToAppend.push([
          team.name,
          team.timezone,
          team.check_in_time,
          team.reminder_delay_hours,
          team.active,
        ]);

        teamsFromSheet.add(team.name);
      }
    }

    await googleSheetsService.appendTeams(teamsToAppend);

    logger.info("StaffSyncService", "syncTeams finished", {
      appendedTeamsCount: teamsToAppend.length,
    });

    return teamsByName;
  }

  private async syncUsers(validRows: StaffRow[]): Promise<Map<string, User>> {
    logger.info("StaffSyncService", "syncUsers started");

    const userRows = await googleSheetsService.readUsersSheet();

    const usersFromSheet = new Map<
      string,
      { rowNumber: number; teamName: string }
    >();

    for (const [index, row] of userRows.entries()) {
      usersFromSheet.set(row[0], {
        rowNumber: index + 2,
        teamName: row[2] ?? "",
      });
    }

    const allUsers = await userRepository.findAll();

    const usersByEmail = new Map<string, User>();

    allUsers.forEach((user) => {
      usersByEmail.set(user.email, user);
    });

    const usersToAppend: UserSheetRow[] = [];

    const usersToUpdate: {
      rowNumber: number;
      teamName: string;
    }[] = [];

    for (const row of validRows) {
      const existingUser = usersByEmail.get(row.email);

      let user: User;

      if (existingUser) {
        user = existingUser;
      } else {
        user = await userRepository.create({
          name: row.name,
          email: row.email,
          status: USER_STATUS.ACTIVE,
        });

        usersByEmail.set(user.email, user);
      }

      const sheetUser = usersFromSheet.get(user.email);
      const staffTeamName = row.teamName ?? "";

      if (!sheetUser) {
        if (!row.teamName) {
          continue;
        }

        usersToAppend.push([
          user.email,
          user.name,
          row.teamName,
          LANG.UK,
          TEAM_MEMBER_ROLE.MEMBER,
          true,
        ]);

        usersFromSheet.set(user.email, {
          rowNumber: -1,
          teamName: row.teamName,
        });

        continue;
      }

      if (sheetUser.teamName !== staffTeamName) {
        usersToUpdate.push({
          rowNumber: sheetUser.rowNumber,
          teamName: staffTeamName,
        });
      }
    }

    await googleSheetsService.appendUsers(usersToAppend);
    await googleSheetsService.updateUserTeams(usersToUpdate);

    logger.info("StaffSyncService", "syncUsers finished", {
      appendedUsersCount: usersToAppend.length,
      updatedUsersCount: usersToUpdate.length,
    });

    return usersByEmail;
  }

  private async syncMemberships(
    validRows: StaffRow[],
    users: Map<string, User>,
    teams: Map<string, Team>,
  ): Promise<SyncErrorData[]> {
    logger.info("StaffSyncService", "syncMemberships started");

    const errors: SyncErrorData[] = [];

    const teamMembers = await teamMemberRepository.findAll();

    const membershipsByUserAndTeam = new Map<string, TeamMember>();
    const activeMembershipsByUser = new Map<string, TeamMember[]>();

    teamMembers.forEach((teamMember) => {
      const key = `${teamMember.user_id}:${teamMember.team_id}`;

      membershipsByUserAndTeam.set(key, teamMember);

      if (!teamMember.active) {
        return;
      }

      const memberships = activeMembershipsByUser.get(teamMember.user_id) ?? [];

      memberships.push(teamMember);
      activeMembershipsByUser.set(teamMember.user_id, memberships);
    });

    for (const row of validRows) {
      const user = users.get(row.email);

      if (!user) {
        errors.push({
          sheet_name: "SSS_Team",
          row_number: row.rowNumber,
          email: row.email,
          team_name: row.teamName ?? "",
          error_type: "SYNC_ERROR",
          error_message: "User not found",
          raw_data: JSON.stringify(row),
        });

        continue;
      }

      const activeMemberships = activeMembershipsByUser.get(user.id) ?? [];

      if (!row.teamName) {
        if (activeMemberships.length > 0) {
          await teamMemberRepository.deactivateAllByUserId(user.id);
        }

        continue;
      }

      const team = teams.get(row.teamName);

      if (!team) {
        errors.push({
          sheet_name: "SSS_Team",
          row_number: row.rowNumber,
          email: row.email,
          team_name: row.teamName,
          error_type: "SYNC_ERROR",
          error_message: "Team not found",
          raw_data: JSON.stringify(row),
        });

        continue;
      }

      const membershipKey = `${user.id}:${team.id}`;
      const membership = membershipsByUserAndTeam.get(membershipKey);

      if (!membership) {
        const newMembership = await teamMemberRepository.create({
          team_id: team.id,
          user_id: user.id,
        });

        membershipsByUserAndTeam.set(membershipKey, newMembership);
      } else if (!membership.active) {
        const updatedMembership = await teamMemberRepository.update(
          membership.id,
          {
            active: true,
          },
        );

        membershipsByUserAndTeam.set(membershipKey, updatedMembership);
      }

      const hasOtherActiveMembership = activeMemberships.some(
        (item) => item.team_id !== team.id,
      );

      if (hasOtherActiveMembership) {
        await teamMemberRepository.deactivateOtherTeams(user.id, team.id);
      }
    }

    logger.info("StaffSyncService", "syncMemberships finished", {
      errorsCount: errors.length,
    });

    return errors;
  }

  private isSafeToDisableMissingUsers(
    observedEmails: Set<string>,
    usersByEmail: Map<string, User>,
  ): boolean {
    const MIN_STAFF_RATIO = 0.8;

    const activeUsersCount = Array.from(usersByEmail.values()).filter(
      (user) => user.status === USER_STATUS.ACTIVE,
    ).length;

    if (observedEmails.size === 0) {
      logger.warn("StaffSyncService", "Staff safety check failed", {
        observedEmailsCount: 0,
        activeUsersCount,
        reason: "No staff emails observed",
        action: "Skipping disableMissingUsers",
      });

      return false;
    }

    if (activeUsersCount === 0) return true;

    if (observedEmails.size / activeUsersCount < MIN_STAFF_RATIO) {
      logger.warn("StaffSyncService", "Staff safety check failed", {
        observedEmailsCount: observedEmails.size,
        activeUsersCount,
        staffRatio: observedEmails.size / activeUsersCount,
        minStaffRatio: MIN_STAFF_RATIO,
        action: "Skipping disableMissingUsers",
      });

      return false;
    }
    return true;
  }

  private async disableMissingUsers(
    observedEmails: Set<string>,
    usersByEmail: Map<string, User>,
  ): Promise<number> {
    logger.info("StaffSyncService", "disableMissingUsers started");

    let deactivatedUsersCount = 0;

    for (const user of usersByEmail.values()) {
      if (user.status !== USER_STATUS.ACTIVE) {
        continue;
      }

      if (observedEmails.has(user.email)) {
        continue;
      }

      await userRepository.update(user.id, { status: USER_STATUS.DISABLED });
      await teamMemberRepository.deactivateAllByUserId(user.id);
      deactivatedUsersCount += 1;
    }

    logger.info("StaffSyncService", "disableMissingUsers finished", {
      deactivatedUsersCount,
    });

    return deactivatedUsersCount;
  }

  async syncStaff(): Promise<void> {
    if (this.isSyncing) {
      logger.warn("StaffSyncService", "Staff sync already running, skipping");
      return;
    }

    this.isSyncing = true;

    try {
      const rows = await googleSheetsService.readStaffSheet();

      const {
        validRows,
        errors: parsedErrors,
        observedEmails,
      } = parseStaffRows(rows);

      logger.info("StaffSyncService", "StaffSync report", {
        rowsCount: rows.length,
        validRowsLength: validRows.length,
        errorsLength: parsedErrors.length,
        observedEmailsSize: observedEmails.size,
      });

      const teams = await this.syncTeams(validRows);
      const users = await this.syncUsers(validRows);
      const membershipErrors = await this.syncMemberships(
        validRows,
        users,
        teams,
      );

      const errors = parsedErrors.concat(membershipErrors);

      const safeToDisableMissingUsers = this.isSafeToDisableMissingUsers(
        observedEmails,
        users,
      );

      let deactivatedUsersCount = 0;

      if (safeToDisableMissingUsers) {
        deactivatedUsersCount = await this.disableMissingUsers(
          observedEmails,
          users,
        );
      }

      await googleSheetsService.appendSyncErrors(errors);

      logger.info("StaffSyncService", "Staff sync completed", {
        rowsCount: rows.length,
        validRowsCount: validRows.length,
        errorsCount: errors.length,
        observedEmailsCount: observedEmails.size,
        deactivatedUsersCount,
        missingUsersDeactivationSkipped: !safeToDisableMissingUsers,
      });
    } finally {
      this.isSyncing = false;
    }
  }
}

export const staffSyncService = new StaffSyncService();
