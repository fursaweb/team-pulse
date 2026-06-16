import { CHECKIN_RESPONSE_STATUS } from "../../types/checkinResponse.types";
import { LANG } from "../../types/user.types";

enum DAILY_STATUS {
  NO_RESPONSE = "NO_RESPONSE",
  SAFE = "SAFE",
}

type SyncErrorData = {
  sheet_name: string;
  row_number: number;
  email?: string;
  team_name?: string;
  error_type: "VALIDATION_ERROR" | "SYNC_ERROR";
  error_message: string;
  raw_data: string;
};

type DailyStatusRow = [
  string, // date
  string, // team_name
  string, // user_name
  string, // email
  LANG,
  DAILY_STATUS,
  string, // responded_at
  boolean,
  string, // reminder_sent_at
  string, // checkin_id
  string, // user_id
];

export { SyncErrorData, DailyStatusRow, DAILY_STATUS };
