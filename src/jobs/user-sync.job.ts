import { teamsSyncService } from "../modules/teams/teams.sync.service";
import { usersSyncService } from "../modules/users/users.sync.service";

export const userSyncJob = async () => {
  try {
    console.log("[UserSyncJob] Started: Sync Teams");
    const teams = await teamsSyncService.syncTeams();
    console.log(
      `[UserSyncJob] Finished. Sync Teams Total:${teams.totalRows} Sent: ${teams.syncedRows}, Failed: ${teams.failedRows}`,
    );

    console.log("[UserSyncJob] Started: Sync Users");
    const result = await usersSyncService.syncUsers();
    console.log(
      `[UserSyncJob] Finished. Sync Users Total:${result.totalRows} Sent: ${result.syncedRows}, Failed: ${result.failedRows}`,
    );
  } catch (error) {
    console.error("[UserSyncJob] Failed", error);
  }
};
