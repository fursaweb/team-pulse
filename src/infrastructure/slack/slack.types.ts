import { LANG } from "../../types/user.types";

type SendCheckinMessageData {
  slackUserId: string,
  checkinId: string,
  language: LANG
}

export {
    SendCheckinMessageData
} 