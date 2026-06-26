import { checkinsService } from "../modules/checkins/checkins.service";

export const reminderJob = async () => {
  try {
    console.log("[ReminderJob] Started");
    const result = await checkinsService.processDueReminders();
    console.log(
      `[ReminderJob] Finished. Sent: ${result.sentCount}, Failed: ${result.failedCount}`,
    );
  } catch (error) {
    console.error("[ReminderJob] Failed", error);
  }
};
