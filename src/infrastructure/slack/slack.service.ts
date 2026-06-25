import { SendCheckinMessageData } from "../slack/slack.types";
import { slackApp } from "./slack.client";
import { t } from "../../shared/i18n";
import { LANG } from "../../types/user.types";

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

  private buildCheckinMessage(checkinId: string, lang: LANG) {
    return {
      text: t(lang, "checkin.dailyMessage"),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: t(lang, "checkin.dailyMessage"),
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: t(lang, "checkin.safeButton"),
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

  private buildReminderMessage(checkinId: string, lang: LANG) {
    return {
      text: t(lang, "checkin.reminderMessage"),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: t(lang, "checkin.reminderMessage"),
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: t(lang, "checkin.safeButton"),
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

  private buildSafeConfirmedMessage(lang: LANG) {
    return {
      text: t(lang, "checkin.confirmationMessage"),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: t(lang, "checkin.confirmationMessage"),
          },
        },
      ],
    };
  }

  private buildAlreadyRespondedMessage(lang: LANG) {
    return {
      text: t(lang, "checkin.duplicateResponse"),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: t(lang, "checkin.duplicateResponse"),
          },
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

  private async updateMessage(
    channelId: string,
    ts: string,
    text: string,
    blocks: any[],
  ) {
    const response = await slackApp.client.chat.update({
      channel: channelId,
      ts,
      text,
      blocks,
    });

    const messageTs = response.ts;

    if (!messageTs) {
      throw new Error("Failed to update Slack message");
    }

    return {
      channelId,
      messageTs,
    };
  }

  async findUserByEmail(email: string): Promise<string | null> {
    try {
      const result = await slackApp.client.users.lookupByEmail({
        email,
      });

      return result.user?.id ?? null;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        (error as any).data?.error === "users_not_found"
      ) {
        return null;
      }

      throw error;
    }
  }

  async updateSafeConfirmedMessage(
    channelId: string,
    messageTs: string,
    lang: LANG,
  ) {
    const message = this.buildSafeConfirmedMessage(lang);
    this.updateMessage(channelId, messageTs, message.text, message.blocks);
  }

  async updateAlreadyRespondedMessage(
    channelId: string,
    messageTs: string,
    lang: LANG,
  ) {
    const message = this.buildAlreadyRespondedMessage(lang);
    this.updateMessage(channelId, messageTs, message.text, message.blocks);
  }

  async sendCheckinMessage(data: SendCheckinMessageData) {
    const channelId = await this.openDirectMessage(data.slackUserId);
    const message = this.buildCheckinMessage(data.checkinId, data.language);
    return this.postMessage(channelId, message.text, message.blocks);
  }

  async sendReminderMessage(data: SendCheckinMessageData) {
    const channelId = await this.openDirectMessage(data.slackUserId);
    const message = this.buildReminderMessage(data.checkinId, data.language);
    return this.postMessage(channelId, message.text, message.blocks);
  }
}

export const slackService = new SlackService();
