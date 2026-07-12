import { logger } from "../infrastructure/logger/logger";
import { checkinsService } from "../modules/checkins/checkins.service";

export const dailyCheckinJob = async () => {
  try {
    logger.info("DailyCheckinJob", "Started. Create checkins");

    const createdCheckins = await checkinsService.createDailyCheckins();

    logger.info("DailyCheckinJob", "Finished. Created checkins", {
      Total: createdCheckins.totalTeams,
      Created: createdCheckins.created,
      Skipped: createdCheckins.skipped,
    });

    logger.info("DailyCheckinJob", "Started. Dispatch checkins");

    const dispatchCheckins = await checkinsService.dispatchCreatedCheckins();

    logger.info("DailyCheckinJob", "Finished. Dispatch checkins", {
      Sent: dispatchCheckins.sentCount,
      Failed: dispatchCheckins.failedCount,
    });

    return {
      createdCheckins,
      dispatchCheckins,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown DailyCheckinJob error";

    logger.error("DailyCheckinJob", "Failed", {
      error: errorMessage,
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown DailyCheckinJob error");
  }
};
