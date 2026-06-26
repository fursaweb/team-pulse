import { googleSheetsService } from "../../infrastructure/google/googleSheets.service";
import { SyncErrorData } from "../../infrastructure/google/googleShets.types";
import { teamRepository } from "../../repositories/team.repository";
import { TeamSyncRow, teamSyncRowSchema } from "./teams.validator";

class TeamsSyncService {
  private parseTeamRow(row: string[]): Partial<TeamSyncRow> {
    const [team_name, timezone, check_in_time, reminder_delay_hours, active] =
      row;

    const normalizedReminderDelay = Number(reminder_delay_hours);

    const normalizedCheckInTime = check_in_time?.trim();

    let formattedCheckInTime = normalizedCheckInTime;

    if (normalizedCheckInTime) {
      const [hour, minute] = normalizedCheckInTime.split(":");

      formattedCheckInTime = `${hour.padStart(2, "0")}:${minute}`;
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
      name: team_name,
      timezone,
      check_in_time: formattedCheckInTime,
      reminder_delay_hours: normalizedReminderDelay,
      active: normalizedActive,
    };
  }

  private async syncTeam(row: TeamSyncRow) {
    const existingTeam = await teamRepository.findByName(row.name);
    const { name, timezone, check_in_time, reminder_delay_hours, active } = row;
    if (!existingTeam) {
      const newTeam = await teamRepository.create({
        name,
        timezone,
        check_in_time,
        reminder_delay_hours,
        active,
      });
      return newTeam;
    }

    const updatedTeam = await teamRepository.update(existingTeam.id, {
      name,
      timezone,
      check_in_time,
      reminder_delay_hours,
      active,
    });

    return updatedTeam;
  }

  async syncTeams() {
    const rows = await googleSheetsService.readTeamsSheet();

    const totalRows = rows.length;
    let syncedRows = 0;
    let failedRows = 0;

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const parsedRow = this.parseTeamRow(row);
      const result = teamSyncRowSchema.safeParse(parsedRow);

      if (!result.success) {
        // write Sync Errors
        const syncErrorData: SyncErrorData = {
          sheet_name: "Teams",
          row_number: rowNumber,
          email: "",
          team_name: parsedRow.name ?? "",
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
        const team = await this.syncTeam(validRow);
        syncedRows++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown sync error";

        const syncErrorData: SyncErrorData = {
          sheet_name: "Teams",
          row_number: rowNumber,
          email: "",
          team_name: parsedRow.name ?? "",
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

export const teamsSyncService = new TeamsSyncService();
