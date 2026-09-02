import { logger } from "../infrastructure/logger/logger";
import { staffSyncService } from "../modules/staff/staffSync.service";

export const runStaffSyncJob = async (): Promise<void> => {
  try {
    logger.info("StaffSyncJob", "Staff sync job started");
    await staffSyncService.syncStaff();
    logger.info("StaffSyncJob", "Staff sync job finished");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Staff sync job failed";

    logger.error("StaffSyncJob", "Failed", {
      error: errorMessage,
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(errorMessage);
  }
};
