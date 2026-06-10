enum CHECKIN_STATUS {
  CREATED = "CREATED",
  SENT = "SENT",
  REMINDER_SENT = "REMINDER_SENT",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

type Checkin = {
  id: string;
  team_id: string;
  date: string;
  scheduled_at: string;
  sent_at: string | null;
  reminder_scheduled_at: string;
  reminder_sent_at: string | null;
  status: CHECKIN_STATUS;
  created_at: string;
  updated_at: string;
};

type CreateCheckinData = {
  team_id: string;
  date: string;
  scheduled_at: string;
  reminder_scheduled_at: string;
  status?: CHECKIN_STATUS;
  sent_at?: string;
  reminder_sent_at?: string;
};

type UpdateCheckinData = {
  id: string;
  status?: CHECKIN_STATUS;
  sent_at?: string;
  reminder_sent_at?: string;
  scheduled_at?: string;
  reminder_scheduled_at?: string;
};

export { Checkin, CreateCheckinData, UpdateCheckinData, CHECKIN_STATUS };
