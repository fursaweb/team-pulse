import { CHECKIN_RESPONSE_STATUS } from "../../types/checkinResponse.types";
import { TEAM_MEMBER_ROLE } from "../../types/teamMember.type";
import { LANG, USER_STATUS } from "../../types/user.types";

enum DAILY_STATUS {
  NO_RESPONSE = "NO_RESPONSE",
  SAFE = "SAFE",
}

type SyncErrorData = {
  sheet_name: string;
  row_number: number;
  email?: string;
  team_name?: string;
  error_type: "VALIDATION_ERROR" | "SYNC_ERROR" | "SLACK_USER_NOT_FOUND";
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

type TeamSheetRow = [
  string, // name
  string, // timezone
  string, // check_in_time
  number, // reminder_delay_hours
  boolean, // active
];

type UserSheetRow = [
  string, // email
  string, // name
  string, // team_name
  LANG,
  TEAM_MEMBER_ROLE,
  boolean, // active
];

type UserTeamUpdate = {
  rowNumber: number;
  teamName: string;
};

export {
  SyncErrorData,
  DailyStatusRow,
  TeamSheetRow,
  UserSheetRow,
  UserTeamUpdate,
  DAILY_STATUS,
};
