import { userSyncService } from "../modules/users/user.sync.service";

export const userSyncJob = async () => {
  try {
    console.log("[UserSyncJob] Started");
    const result = await userSyncService.syncUsers();
    console.log(
      `[UserSyncJob] Finished. Total:${result.totalRows} Sent: ${result.syncedRows}, Failed: ${result.failedRows}`,
    );
  } catch (error) {
    console.error("[UserSyncJob] Failed", error);
  }
};
