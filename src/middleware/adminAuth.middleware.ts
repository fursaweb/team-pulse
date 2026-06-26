import { Request, Response, NextFunction } from "express";
import { envConfig } from "../config/env";

export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const adminToken = req.header("x-admin-token");

  if (!adminToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (adminToken !== envConfig.adminToken) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
};
