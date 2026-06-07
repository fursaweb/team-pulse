type SyncErrorData = {
  sheet_name: string;
  row_number: number;
  email?: string;
  team_name?: string;
  error_type: "VALIDATION_ERROR" | "SYNC_ERROR";
  error_message: string;
  raw_data: string;
};

export { SyncErrorData };
