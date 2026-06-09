import express from "express";
import { slackReceiver } from "../infrastructure/slack/slack.client";
import { envConfig } from "../config/env";

const app = express();
app.use(slackReceiver.router);
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "OK" });
});

app.listen(envConfig.port, () =>
  console.log(`Server running on localhost:${envConfig.port}`),
);
