import { googleSheetsService } from "../../infrastructure/google/googleSheets.service";
import { SyncErrorData } from "../../infrastructure/google/googleShets.types";
import { logger } from "../../infrastructure/logger/logger";
import { teamRepository } from "../../repositories/team.repository";
import { teamMemberRepository } from "../../repositories/teamMember.repository";
import { userRepository } from "../../repositories/user.repository";
import { Team } from "../../types/team.types";
import { TeamMember } from "../../types/teamMember.type";
import { User, USER_STATUS } from "../../types/user.types";
import { parseStaffRows } from "./staff.parser";
import { StaffRow } from "./staff.schema";

class StaffSyncService {
  private async syncTeams(validRows: StaffRow[]): Promise<Map<string, Team>> {
    logger.info("StaffSyncService", "syncTeams started");

    const allTeams = await teamRepository.findAll();
    const teamsByName: Map<string, Team> = new Map();

    allTeams.forEach((team) => teamsByName.set(team.name, team));

    const teamNames = validRows
      .map((row) => row.teamName)
      .filter((teamName): teamName is string => Boolean(teamName));

    const uniqueTeamNames = Array.from(new Set(teamNames));

    for (const teamName of uniqueTeamNames) {
      const team = teamsByName.get(teamName);

      if (!team) {
        const newTeam = await teamRepository.create({ name: teamName });
        teamsByName.set(newTeam.name, newTeam);
      }
    }
    logger.info("StaffSyncService", "syncTeams finished");

    return teamsByName;
  }

  private async syncUsers(validRows: StaffRow[]): Promise<Map<string, User>> {
    logger.info("StaffSyncService", "syncUsers started");

    const allUsers = await userRepository.findAll();
    const usersByEmail: Map<string, User> = new Map();

    allUsers.forEach((user) => usersByEmail.set(user.email, user));

    for (const row of validRows) {
      const existingUser = usersByEmail.get(row.email);

      if (!existingUser) {
        const user = await userRepository.create({
          name: row.name,
          email: row.email,
          status: USER_STATUS.ACTIVE,
        });

        usersByEmail.set(user.email, user);
        continue;
      }

      if (existingUser.name !== row.name) {
        const user = await userRepository.update(existingUser.id, {
          name: row.name,
        });
        usersByEmail.set(user.email, user);
      }
    }
    logger.info("StaffSyncService", "syncUsers finished");

    return usersByEmail;
  }

  private async syncMemberships(
    validRows: StaffRow[],
    users: Map<string, User>,
    teams: Map<string, Team>,
  ): Promise<void> {
    logger.info("StaffSyncService", "syncMemberships started");

    const teamMembers = await teamMemberRepository.findAll();

    const membershipsByUserAndTeam = new Map<string, TeamMember>();
    const activeMembershipsByUser = new Map<string, TeamMember[]>();

    teamMembers.forEach((teamMember) => {
      membershipsByUserAndTeam.set(
        `${teamMember.user_id}:${teamMember.team_id}`,
        teamMember,
      );

      if (!teamMember.active) return;

      const memberships = activeMembershipsByUser.get(teamMember.user_id) ?? [];

      memberships.push(teamMember);
      activeMembershipsByUser.set(teamMember.user_id, memberships);
    });

    for (const row of validRows) {
      const user = users.get(row.email);

      if (!user) {
        console.log("User not found", row.email);
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
        console.log("Team not found", row.teamName);
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

        const hasOtherActiveMembership = activeMemberships.some(
          (item) => item.team_id !== team.id,
        );

        if (hasOtherActiveMembership) {
          await teamMemberRepository.deactivateOtherTeams(user.id, team.id);
        }

        continue;
      }

      if (!membership.active) {
        const updatedMembership = await teamMemberRepository.update(
          membership.id,
          { active: true },
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

    logger.info("StaffSyncService", "syncMemberships finished");
  }

  async syncStaff(): Promise<void> {
    const rows = await googleSheetsService.readStaffSheet();

    const { validRows, errors, observedEmails } = parseStaffRows(rows);

    logger.info("StaffSyncService", "StaffSync report", {
      rowsCount: rows.length,
      validRowsLength: validRows.length,
      errorsLength: errors.length,
      observedEmailsSize: observedEmails.size,
    });

    const teams = await this.syncTeams(validRows);
    const users = await this.syncUsers(validRows);
    await this.syncMemberships(validRows, users, teams);
  }
}

export const staffSyncService = new StaffSyncService();
