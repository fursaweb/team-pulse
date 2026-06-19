import { googleSheetsClient } from "../../infrastructure/google/googleSheets.client";
import { envConfig } from "../../config/env";
import { SyncErrorData, DailyStatusRow } from "./googleShets.types";
import { CHECKIN_RESPONSE_STATUS } from "../../types/checkinResponse.types";

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

const appendDailyStatusRows = async (rows: DailyStatusRow[]) => {
  await googleSheetsClient.spreadsheets.values.append({
    spreadsheetId: envConfig.googleSheetsSpreadsheetId,
    range: "Daily Status!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
};

const updateDailyStatusResponse = async (checkinId: string, userId: string) => {
  const response = await googleSheetsClient.spreadsheets.values.get({
    spreadsheetId: envConfig.googleSheetsSpreadsheetId,
    range: "Daily Status!A:K",
  });

  const rows = response.data.values ?? [];

  const rowIndex = rows.findIndex(
    (row) => row[9] === checkinId && row[10] === userId,
  );

  if (rowIndex === -1) {
    throw new Error(
      `Daily Status row not found for checkin ${checkinId} and user ${userId}`,
    );
  }

  const rowNumber = rowIndex + 1;

  await googleSheetsClient.spreadsheets.values.update({
    spreadsheetId: envConfig.googleSheetsSpreadsheetId,
    range: `Daily Status!F${rowNumber}:G${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[CHECKIN_RESPONSE_STATUS.SAFE, new Date().toISOString()]],
    },
  });
};

export const googleSheetsService = {
  appendSyncError,
  readUsersSheet,
  appendDailyStatusRows,
  updateDailyStatusResponse,
};
