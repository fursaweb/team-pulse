import express from "express";
import { slackReceiver } from "../infrastructure/slack/slack.client";
import { envConfig } from "../config/env";
import { registerSlackHandlers } from "../infrastructure/slack/slack.handlers";
import { startScheduler } from "../scheduler/scheduler";
import adminRouter from "./routes";

const app = express();
app.use(slackReceiver.router);
app.use(express.json());
app.use("/admin", adminRouter);

registerSlackHandlers();
startScheduler();

app.get("/health", async (req, res) => {
  return res.status(200).json({ status: "OK" });
});

app.listen(envConfig.port, () => {
  console.log(`Server running on localhost:${envConfig.port}`);
});
