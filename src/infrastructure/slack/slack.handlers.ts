import { checkinsService } from "../../modules/checkins/checkins.service";
import { slackApp } from "./slack.client";
import { isCheckinSafeActionPayload } from "./slack.types";

export const registerSlackHandlers = () => {
  slackApp.action("CHECKIN_SAFE", async ({ ack, body }) => {
    await ack();

    if (!isCheckinSafeActionPayload(body)) {
      throw new Error("Invalid CHECKIN_SAFE payload");
    }

    const slackUserId = body.user.id;
    const checkinId = body.actions[0].value;
    const channelId = body.channel.id;
    const messageTs = body.message.ts;

    await checkinsService.processSafeResponse(
      slackUserId,
      checkinId,
      channelId,
      messageTs,
    );
  });
};
