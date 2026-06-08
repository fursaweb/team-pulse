import { supabase } from "./../infrastructure/database/supabase.client";
import {
  NotificationLog,
  CreateNotificationLogData,
  NOTIFICATION_TYPE,
} from "../types/notificationLog.types";

class NotificationLogRepository {
  async findById(id: string): Promise<NotificationLog | null> {
    const { data: notificationLog, error } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!notificationLog) return null;

    return notificationLog;
  }

  async findByCheckinAndUserAndType(
    checkinId: string,
    userId: string,
    type: NOTIFICATION_TYPE,
  ): Promise<NotificationLog | null> {
    const { data: notificationLog, error } = await supabase
      .from("notification_logs")
      .select("*")
      .match({ checkin_id: checkinId, user_id: userId, type: type })
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!notificationLog) return null;

    return notificationLog;
  }

  async findByCheckinId(checkinId: string): Promise<NotificationLog[]> {
    const { data: notificationLogs, error } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("checkin_id", checkinId);

    if (error) throw new Error(error.message);

    return notificationLogs;
  }

  async create(data: CreateNotificationLogData): Promise<NotificationLog> {
    const { data: notificationLog, error } = await supabase
      .from("notification_logs")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!notificationLog) throw new Error("Failed to create notification log");

    return notificationLog;
  }
}

export const notificationLogRepository = new NotificationLogRepository();
