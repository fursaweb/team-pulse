enum NOTIFICATION_CHANNEL {
  SLACK = "SLACK",
}

enum NOTIFICATION_TYPE {
  CHECK_IN = "CHECK_IN",
  REMINDER = "REMINDER",
}

enum NOTIFICATION_STATUS {
  SENT = "SENT",
  FAILED = "FAILED",
}

type NotificationLog = {
  id: string;
  checkin_id: string;
  user_id: string;
  channel: NOTIFICATION_CHANNEL;
  type: NOTIFICATION_TYPE;
  status: NOTIFICATION_STATUS;
  slack_channel_id: string;
  slack_message_ts: string;
  sent_at: string;
  error_message: string;
  created_at: string;
};

type CreateNotificationLogData = {
  checkin_id: string;
  user_id: string;
  type: NOTIFICATION_TYPE;
  status: NOTIFICATION_STATUS;
  channel?: NOTIFICATION_CHANNEL;
  slack_channel_id?: string;
  slack_message_ts?: string;
  sent_at?: string | null;
  error_message?: string;
};

export {
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  NotificationLog,
  CreateNotificationLogData,
};
