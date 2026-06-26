import express from "express";
import { syncUsersController } from "../controllers/syncUsers.controller";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";
import { runCheckinsController } from "../controllers/runCheckins.controller";
import { runRemindersController } from "../controllers/runReminders.controller";

const adminRouter = express.Router();

adminRouter.use(adminAuthMiddleware);

adminRouter.post("/sync/users", syncUsersController);
adminRouter.post("/checkins/run", runCheckinsController);
adminRouter.post("/reminders/run", runRemindersController);

export default adminRouter;
