import cron from "node-cron";
import { userSyncJob } from "../jobs/user-sync.job";
import { dailyCheckinJob } from "../jobs/daily-checkin.job";
import { reminderJob } from "../jobs/reminder.job";

export const startScheduler = () => {
  console.log("[Scheduler] Started");

  let isUserSyncRunning = false;
  let isDailyCheckinRunning = false;
  let isReminderRunning = false;

  console.log("[Scheduler] UserSyncJob registered");

  cron.schedule("*/15 * * * *", async () => {
    if (isUserSyncRunning) {
      console.log("[Scheduler] UserSyncJob skipped");
      return;
    }

    try {
      isUserSyncRunning = true;
      await userSyncJob();
    } finally {
      isUserSyncRunning = false;
    }
  });

  console.log("[Scheduler] DailyCheckinJob registered");

  cron.schedule("*/5 * * * *", async () => {
    if (isDailyCheckinRunning) {
      console.log("[Scheduler] DailyCheckinJob skipped");
      return;
    }

    try {
      isDailyCheckinRunning = true;
      await dailyCheckinJob();
    } finally {
      isDailyCheckinRunning = false;
    }
  });

  console.log("[Scheduler] ReminderJob registered");

  cron.schedule("*/5   * * * *", async () => {
    if (isReminderRunning) {
      console.log("[Scheduler] ReminderJob skipped");
      return;
    }

    try {
      isReminderRunning = true;
      await reminderJob();
    } finally {
      isReminderRunning = false;
    }
  });
};
