import { checkinsService } from "../modules/checkins/checkins.service";

export const reminderJob = async () => {
  try {
    console.log("[ReminderJob] Started");

    const checkins = await checkinsService.processDueReminders();

    console.log(
      `[ReminderJob] Finished. Sent: ${checkins.sentCount}, Failed: ${checkins.failedCount}`,
    );

    return {
      checkins,
    };
  } catch (error) {
    console.error("[ReminderJob] Failed", error);
  }
};
