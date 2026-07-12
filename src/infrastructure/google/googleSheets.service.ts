import { envConfig } from "../../config/env";
import { CHECKIN_RESPONSE_STATUS } from "../../types/checkinResponse.types";
import { logger } from "../logger/logger";
import { googleSheetsClient } from "./googleSheets.client";
import { DailyStatusRow, SyncErrorData } from "./googleShets.types";

const CONTEXT = "GoogleSheetsService";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown Google Sheets error";

const logAndRethrow = (
  message: string,
  error: unknown,
  meta: Record<string, unknown> = {},
): never => {
  const errorMessage = getErrorMessage(error);

  logger.error(CONTEXT, message, {
    ...meta,
    error: errorMessage,
  });

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(errorMessage);
};

const readUsersSheet = async (): Promise<string[][]> => {
  const range = "Users!A2:F";

  try {
    const response = await googleSheetsClient.spreadsheets.values.get({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
    });

    const rows = response.data.values ?? [];

    logger.debug(CONTEXT, "Users sheet read", {
      range,
      rowsCount: rows.length,
    });

    return rows;
  } catch (error) {
    return logAndRethrow("Failed to read Users sheet", error, {
      range,
    });
  }
};

const readTeamsSheet = async (): Promise<string[][]> => {
  const range = "Teams!A2:E";

  try {
    const response = await googleSheetsClient.spreadsheets.values.get({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
    });

    const rows = response.data.values ?? [];

    logger.debug(CONTEXT, "Teams sheet read", {
      range,
      rowsCount: rows.length,
    });

    return rows;
  } catch (error) {
    return logAndRethrow("Failed to read Teams sheet", error, {
      range,
    });
  }
};

const appendSyncError = async (errorData: SyncErrorData): Promise<void> => {
  const range = "Sync Errors!A:H";

  try {
    await googleSheetsClient.spreadsheets.values.append({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
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

    logger.info(CONTEXT, "Sync error appended", {
      sourceSheet: errorData.sheet_name,
      rowNumber: errorData.row_number,
      errorType: errorData.error_type,
    });
  } catch (error) {
    logAndRethrow("Failed to append sync error", error, {
      range,
      sourceSheet: errorData.sheet_name,
      rowNumber: errorData.row_number,
      errorType: errorData.error_type,
    });
  }
};

const appendDailyStatusRows = async (rows: DailyStatusRow[]): Promise<void> => {
  const range = "Daily Status!A:K";

  if (rows.length === 0) {
    logger.warn(CONTEXT, "Daily Status append skipped because rows are empty");
    return;
  }

  try {
    await googleSheetsClient.spreadsheets.values.append({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    logger.info(CONTEXT, "Daily Status rows appended", {
      rowsCount: rows.length,
    });
  } catch (error) {
    logAndRethrow("Failed to append Daily Status rows", error, {
      range,
      rowsCount: rows.length,
    });
  }
};

const findDailyStatusRowNumber = async (
  checkinId: string,
  userId: string,
): Promise<number> => {
  const range = "Daily Status!A:K";

  try {
    const response = await googleSheetsClient.spreadsheets.values.get({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
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

    return rowIndex + 1;
  } catch (error) {
    return logAndRethrow("Failed to find Daily Status row", error, {
      checkinId,
      userId,
    });
  }
};

const updateDailyStatusResponse = async (
  checkinId: string,
  userId: string,
): Promise<void> => {
  try {
    const rowNumber = await findDailyStatusRowNumber(checkinId, userId);
    const range = `Daily Status!F${rowNumber}:G${rowNumber}`;
    const respondedAt = new Date().toISOString();

    await googleSheetsClient.spreadsheets.values.update({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[CHECKIN_RESPONSE_STATUS.SAFE, respondedAt]],
      },
    });

    logger.info(CONTEXT, "Daily Status response updated", {
      checkinId,
      userId,
      rowNumber,
    });
  } catch (error) {
    logAndRethrow("Failed to update Daily Status response", error, {
      checkinId,
      userId,
    });
  }
};

const updateDailyStatusReminder = async (
  checkinId: string,
  userId: string,
): Promise<void> => {
  try {
    const rowNumber = await findDailyStatusRowNumber(checkinId, userId);
    const range = `Daily Status!H${rowNumber}:I${rowNumber}`;
    const reminderSentAt = new Date().toISOString();

    await googleSheetsClient.spreadsheets.values.update({
      spreadsheetId: envConfig.googleSheetsSpreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[true, reminderSentAt]],
      },
    });

    logger.info(CONTEXT, "Daily Status reminder updated", {
      checkinId,
      userId,
      rowNumber,
    });
  } catch (error) {
    logAndRethrow("Failed to update Daily Status reminder", error, {
      checkinId,
      userId,
    });
  }
};

export const googleSheetsService = {
  readUsersSheet,
  readTeamsSheet,
  appendSyncError,
  appendDailyStatusRows,
  updateDailyStatusResponse,
  updateDailyStatusReminder,
};
