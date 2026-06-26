import { Request, Response } from "express";

import { userSyncJob } from "../jobs/user-sync.job";

export const syncUsersController = async (req: Request, res: Response) => {
  try {
    const result = await userSyncJob();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};
