import { SendCheckinMessageData } from "../slack/slack.types";
import { slackApp } from "./slack.client";

class SlackService {
  private async openDirectMessage(slackId: string): Promise<string> {
    const response = await slackApp.client.conversations.open({
      users: slackId,
    });

    const channelId = response.channel?.id;

    if (!channelId) {
      throw new Error("Failed to open Slack DM channel");
    }

    return channelId;
  }

  private buildCheckinMessage(checkinId: string) {
    return {
      text: "Підтвердіть, що ви в безпеці",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Добрий ранок!\nПідтвердіть, що ви в безпеці.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Я в безпеці",
              },
              style: "primary",
              action_id: "CHECKIN_SAFE",
              value: checkinId,
            },
          ],
        },
      ],
    };
  }

  private async postMessage(channelId: string, text: string, blocks: any[]) {
    const response = await slackApp.client.chat.postMessage({
      channel: channelId,
      text: text,
      blocks: blocks,
    });

    const messageTs = response.ts;

    if (!messageTs) {
      throw new Error("Failed to send Slack message");
    }

    return {
      channelId,
      messageTs,
    };
  }

  async sendCheckinMessage(data: SendCheckinMessageData) {
    const channelId = await this.openDirectMessage(data.slackUserId);
    const message = this.buildCheckinMessage(data.checkinId);
    return this.postMessage(channelId, message.text, message.blocks);
  }
}

export const slackService = new SlackService();
