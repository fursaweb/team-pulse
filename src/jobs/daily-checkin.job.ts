import { checkinsService } from "../modules/checkins/checkins.service";

export const dailyCheckinJob = async () => {
  try {
    console.log("[DailyCheckinJob] Started: Create checkins");

    const createdCheckins = await checkinsService.createDailyCheckins();

    console.log(
      `[DailyCheckinJob] Finished: Created checkins Total:${createdCheckins.totalTeams} Created: ${createdCheckins.created}, Skipped: ${createdCheckins.skipped} Failed: ${createdCheckins.failed}`,
    );

    console.log("[DailyCheckinJob] Started: Dispatch checkins");

    const dispatchCheckins = await checkinsService.dispatchCreatedCheckins();

    console.log(
      `[DailyCheckinJob] Finished: Dispatched checkins Sent: ${dispatchCheckins.sentCount}, Failed: ${dispatchCheckins.failedCount}`,
    );

    return {
      createdCheckins,
      dispatchCheckins,
    };
  } catch (error) {
    console.error("[DailyCheckinJob] Failed", error);
  }
};
