import cron from "node-cron";
import { logger } from "../infrastructure/logger/logger";
import { userSyncJob } from "../jobs/user-sync.job";
import { dailyCheckinJob } from "../jobs/daily-checkin.job";
import { reminderJob } from "../jobs/reminder.job";
import { sendDailyEmailReportJob } from "../jobs/send-daily-email-report.job";
import { envConfig } from "../config/env";

export const startScheduler = () => {
  logger.info("Scheduler", "Started");

  let isUserSyncRunning = false;
  let isDailyCheckinRunning = false;
  let isReminderRunning = false;

  logger.info("Scheduler", "UserSyncJob registered");

  cron.schedule("*/15 * * * 1-5", async () => {
    if (isUserSyncRunning) {
      logger.info("Scheduler", "UserSyncJob skipped");
      return;
    }

    try {
      isUserSyncRunning = true;
      await userSyncJob();
    } finally {
      isUserSyncRunning = false;
    }
  });

  logger.info("Scheduler", "DailyCheckinJob registered");

  cron.schedule("*/5 * * * 1-5", async () => {
    if (isDailyCheckinRunning) {
      logger.info("Scheduler", "DailyCheckinJob skipped");
      return;
    }

    try {
      isDailyCheckinRunning = true;
      await dailyCheckinJob();
    } finally {
      isDailyCheckinRunning = false;
    }
  });

  logger.info("Scheduler", "ReminderJob registered");

  cron.schedule("*/5   * * * 1-5", async () => {
    if (isReminderRunning) {
      logger.info("Scheduler", "ReminderJob skipped");
      return;
    }

    try {
      isReminderRunning = true;
      await reminderJob();
    } finally {
      isReminderRunning = false;
    }
  });

  logger.info("Scheduler", "SendDailyEmailReportJob registered");

  cron.schedule(
    envConfig.dailyReportCron,
    async () => {
      await sendDailyEmailReportJob();
    },
    {
      timezone: "Europe/Kyiv",
    },
  );
};
