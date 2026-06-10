import express from "express";
import { slackReceiver } from "../infrastructure/slack/slack.client";
import { envConfig } from "../config/env";
import { checkinsService } from "../modules/checkins/checkins.service";

const app = express();
app.use(slackReceiver.router);
app.use(express.json());

app.get("/health", (req, res) => {
  checkinsService.createDailyCheckins();
  return res.status(200).json({ status: "OK" });
});

app.listen(envConfig.port, () =>
  console.log(`Server running on localhost:${envConfig.port}`),
);
