import { LANG } from "../../types/user.types";

type CheckinSafeActionPayload = {
  user: {
    id: string;
  };
  channel: {
    id: string;
  };
  message: {
    ts: string;
  };
  actions: [
    {
      value: string;
    },
  ];
};

type SendCheckinMessageData = {
  slackUserId: string;
  checkinId: string;
  language: LANG;
};

function isCheckinSafeActionPayload(
  payload: unknown,
): payload is CheckinSafeActionPayload {
  const data = payload as CheckinSafeActionPayload;

  return (
    typeof data?.user?.id === "string" &&
    typeof data?.channel?.id === "string" &&
    typeof data?.message?.ts === "string" &&
    Array.isArray(data?.actions) &&
    typeof data.actions[0]?.value === "string"
  );
}

export {
  SendCheckinMessageData,
  CheckinSafeActionPayload,
  isCheckinSafeActionPayload,
};
