import { logger } from "../infrastructure/logger/logger";
import { checkinsService } from "../modules/checkins/checkins.service";

export const reminderJob = async () => {
  try {
    logger.info("ReminderJob", "Started. Sent reminders");

    const checkins = await checkinsService.processDueReminders();

    logger.info("ReminderJob", "Finished. Sent reminders", {
      Sent: checkins.sentCount,
      Failed: checkins.failedCount,
    });

    return {
      checkins,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown ReminderJob error";

    logger.error("ReminderJob", "Failed", {
      error: errorMessage,
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown ReminderJob error");
  }
};
