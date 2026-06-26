import { Request, Response } from "express";
import { dailyCheckinJob } from "../jobs/daily-checkin.job";

export const runCheckinsController = async (req: Request, res: Response) => {
  try {
    const result = await dailyCheckinJob();

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
