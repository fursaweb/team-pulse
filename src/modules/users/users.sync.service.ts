import { TEAM_MEMBER_ROLE } from "../../types/teamMember.type";
import { LANG, USER_STATUS } from "../../types/user.types";
import { SyncErrorData } from "../../infrastructure/google/googleShets.types";
import { userSyncRowSchema, UserSyncRow } from "./users.validator";
import { teamRepository } from "../../repositories/team.repository";
import { userRepository } from "../../repositories/user.repository";
import { teamMemberRepository } from "../../repositories/teamMember.repository";
import { googleSheetsService } from "../../infrastructure/google/googleSheets.service";
import { slackService } from "../../infrastructure/slack/slack.service";

class UsersSyncService {
  private parseUserRow(row: string[]): Partial<UserSyncRow> {
    const [email, name, team_name, language, team_role, active] = row;

    let normalizedLanguage;
    switch (language) {
      case "en":
        normalizedLanguage = LANG.EN;
        break;
      case "uk":
        normalizedLanguage = LANG.UK;
        break;
    }

    let normalizedTeamRole;

    switch (team_role) {
      case "MEMBER":
        normalizedTeamRole = TEAM_MEMBER_ROLE.MEMBER;
        break;
      case "COORDINATOR":
        normalizedTeamRole = TEAM_MEMBER_ROLE.COORDINATOR;
        break;
    }

    let normalizedActive;
    const normalizedActiveValue = String(active ?? "")
      .trim()
      .toUpperCase();
    switch (normalizedActiveValue) {
      case "TRUE":
        normalizedActive = true;
        break;
      case "FALSE":
        normalizedActive = false;
        break;
    }

    return {
      email,
      name,
      team_name,
      language: normalizedLanguage,
      team_role: normalizedTeamRole,
      active: normalizedActive,
    };
  }

  private async syncTeam(teamName: string) {
    const team = await teamRepository.findByName(teamName);

    if (!team) {
      throw new Error(`Team ${teamName} not found`);
    }

    return team;
  }

  private async syncUser(row: UserSyncRow, slackUserId: string | null) {
    const existingUser = await userRepository.findByEmail(row.email);
    const userStatus = row.active ? USER_STATUS.ACTIVE : USER_STATUS.DISABLED;

    if (!existingUser) {
      const newUser = await userRepository.create({
        name: row.name,
        email: row.email,
        language: row.language,
        status: userStatus,
        slack_user_id: slackUserId,
      });
      return newUser;
    }

    const updatedUser = await userRepository.update(existingUser.id, {
      name: row.name,
      email: row.email,
      language: row.language,
      status: userStatus,
    });

    return updatedUser;
  }

  private async syncMembership(
    teamId: string,
    userId: string,
    row: UserSyncRow,
  ) {
    const teamMember = await teamMemberRepository.findByTeamAndUser(
      teamId,
      userId,
    );

    if (!teamMember) {
      const newTeamMember = await teamMemberRepository.create({
        team_id: teamId,
        user_id: userId,
        role: row.team_role,
        active: row.active,
      });

      return newTeamMember;
    }

    const updatedTeamMember = await teamMemberRepository.update(teamMember.id, {
      role: row.team_role,
      active: row.active,
    });

    return updatedTeamMember;
  }

  async syncUsers() {
    const rows = await googleSheetsService.readUsersSheet();

    const totalRows = rows.length;
    let syncedRows = 0;
    let failedRows = 0;

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const parsedRow = this.parseUserRow(row);
      const result = userSyncRowSchema.safeParse(parsedRow);

      if (!result.success) {
        // write Sync Errors
        const syncErrorData: SyncErrorData = {
          sheet_name: "Users",
          row_number: rowNumber,
          email: parsedRow.email ?? "",
          team_name: parsedRow.team_name ?? "",
          error_type: "VALIDATION_ERROR",
          error_message: result.error.issues
            .map((issue) => issue.message)
            .join("; "),
          raw_data: JSON.stringify(row),
        };

        await googleSheetsService.appendSyncError(syncErrorData);
        failedRows++;
        continue;
      }

      const validRow = result.data;

      try {
        // sync team
        const team = await this.syncTeam(validRow.team_name);

        // get slack id
        const slackUserId = await slackService.findUserByEmail(validRow.email);

        if (!slackUserId) {
          const syncErrorData: SyncErrorData = {
            sheet_name: "Users",
            row_number: rowNumber,
            email: parsedRow.email ?? "",
            team_name: parsedRow.team_name ?? "",
            error_type: "SLACK_USER_NOT_FOUND",
            error_message: `User with email ${parsedRow.email} not found`,
            raw_data: JSON.stringify(row),
          };

          await googleSheetsService.appendSyncError(syncErrorData);
        }

        // sync user
        const user = await this.syncUser(validRow, slackUserId);

        // sync membership
        await this.syncMembership(team.id, user.id, validRow);

        syncedRows++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown sync error";

        const syncErrorData: SyncErrorData = {
          sheet_name: "Users",
          row_number: rowNumber,
          email: parsedRow.email ?? "",
          team_name: parsedRow.team_name ?? "",
          error_type: "SYNC_ERROR",
          error_message: errorMessage,
          raw_data: JSON.stringify(row),
        };

        await googleSheetsService.appendSyncError(syncErrorData);
        failedRows++;
        continue;
      }
    }

    // return result
    return {
      totalRows,
      syncedRows,
      failedRows,
    };
  }
}

export const usersSyncService = new UsersSyncService();
