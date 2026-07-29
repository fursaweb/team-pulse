import { DateTime } from "luxon";
import { emailService } from "../infrastructure/email/email.service";
import { logger } from "../infrastructure/logger/logger";

export const sendDailyEmailReportJob = async () => {
  try {
    const localDate = DateTime.now().setZone("Europe/Kyiv").toISODate();

    if (!localDate) {
      throw new Error("Failed to determine local date");
    }

    logger.info("SendDailyEmailReportJob", "Started");

    await emailService.sendDailyReport(localDate);

    logger.info("SendDailyEmailReportJob", "Daily report sent");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown SendDailyEmailReportJob error";

    logger.error("SendDailyEmailReportJob", "Failed", {
      error: errorMessage,
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown SendDailyEmailReportJob error");
  }
};
