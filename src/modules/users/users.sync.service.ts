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
      return userRepository.create({
        name: row.name,
        email: row.email,
        language: row.language,
        status: userStatus,
        slack_user_id: slackUserId,
      });
    }

    return userRepository.update(existingUser.id, {
      language: row.language,
      status: userStatus,
      slack_user_id: slackUserId ?? existingUser.slack_user_id,
    });
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
      throw new Error(
        `Membership not found for user ${row.email} in team ${row.team_name}`,
      );
    }

    if (teamMember.role === row.team_role) {
      return teamMember;
    }

    return teamMemberRepository.update(teamMember.id, {
      role: row.team_role,
    });
  }

  async syncUsers() {
    const rows = await googleSheetsService.readUsersSheet();

    const totalRows = rows.length;
    let syncedRows = 0;
    let failedRows = 0;

    const errors: SyncErrorData[] = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;

      const parsedRow = this.parseUserRow(row);
      const result = userSyncRowSchema.safeParse(parsedRow);

      if (!result.success) {
        errors.push({
          sheet_name: "Users",
          row_number: rowNumber,
          email: parsedRow.email ?? "",
          team_name: parsedRow.team_name ?? "",
          error_type: "VALIDATION_ERROR",
          error_message: result.error.issues
            .map((issue) => issue.message)
            .join("; "),
          raw_data: JSON.stringify(row),
        });

        failedRows++;
        continue;
      }

      const validRow = result.data;

      try {
        const team = await teamRepository.findByName(validRow.team_name);

        if (!team) {
          throw new Error(`Team ${validRow.team_name} not found`);
        }

        const slackUserId = await slackService.findUserByEmail(validRow.email);

        if (!slackUserId) {
          errors.push({
            sheet_name: "Users",
            row_number: rowNumber,
            email: validRow.email,
            team_name: validRow.team_name,
            error_type: "SLACK_USER_NOT_FOUND",
            error_message: `User with email ${validRow.email} not found`,
            raw_data: JSON.stringify(row),
          });
        }

        const user = await this.syncUser(validRow, slackUserId);

        await this.syncMembership(team.id, user.id, validRow);

        syncedRows++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown sync error";

        errors.push({
          sheet_name: "Users",
          row_number: rowNumber,
          email: validRow.email,
          team_name: validRow.team_name,
          error_type: "SYNC_ERROR",
          error_message: errorMessage,
          raw_data: JSON.stringify(row),
        });

        failedRows++;
      }
    }

    await googleSheetsService.appendSyncErrors(errors);

    return {
      totalRows,
      syncedRows,
      failedRows,
    };
  }
}

export const usersSyncService = new UsersSyncService();
