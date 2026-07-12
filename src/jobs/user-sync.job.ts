import { logger } from "../infrastructure/logger/logger";
import { teamsSyncService } from "../modules/teams/teams.sync.service";
import { usersSyncService } from "../modules/users/users.sync.service";

export const userSyncJob = async () => {
  try {
    logger.info("UserSyncJob", "Started. Sync Teams");

    const teams = await teamsSyncService.syncTeams();

    logger.info("UserSyncJob", "Finished. Sync Teams", {
      Total: teams.totalRows,
      Synced: teams.syncedRows,
      Failed: teams.failedRows,
    });

    logger.info("UserSyncJob", "Started. Sync Users");

    const users = await usersSyncService.syncUsers();

    logger.info("UserSyncJob", "Finished. Sync Users", {
      Total: users.totalRows,
      Synced: users.syncedRows,
      Failed: users.failedRows,
    });

    return {
      teams,
      users,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown UserSyncJob error";

    logger.error("UserSyncJob", "Failed", {
      error: errorMessage,
    });

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown UserSyncJob error");
  }
};
