import { App, ExpressReceiver } from "@slack/bolt";
import { envConfig } from "../../config/env";

export const slackReceiver = new ExpressReceiver({
  signingSecret: envConfig.slackSigningSecret,
});

export const slackApp = new App({
  receiver: slackReceiver,
  token: envConfig.slackBotToken,
});
