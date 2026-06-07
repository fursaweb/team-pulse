import { googleSheetsClient } from "../../infrastructure/google/googleSheets.client";
import { envConfig } from "../../config/env";
import { SyncErrorData } from "./googleShets.types";

const readUsersSheet = async () => {
  const response = await googleSheetsClient.spreadsheets.values.get({
    spreadsheetId: envConfig.googleSheetsSpreadsheetId,
    range: "Users!A2:F10",
  });

  const rows = response.data.values ?? [];

  return rows;
};

const appendSyncError = async (errorData: SyncErrorData) => {
  await googleSheetsClient.spreadsheets.values.append({
    spreadsheetId: envConfig.googleSheetsSpreadsheetId,
    range: "Sync Errors!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          errorData.sheet_name,
          errorData.row_number,
          errorData.email ?? "",
          errorData.team_name,
          errorData.error_type,
          errorData.error_message,
          errorData.raw_data,
        ],
      ],
    },
  });
};

export const googleSheetsService = { appendSyncError, readUsersSheet };
