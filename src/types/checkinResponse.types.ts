enum CHECKIN_RESPONSE_STATUS {
  SAFE = "SAFE",
}

type CheckinResponse = {
  id: string;
  checkin_id: string;
  user_id: string;
  status: CHECKIN_RESPONSE_STATUS;
  responded_at: string;
  created_at: string;
  updated_at: string;
};

type CreateCheckinResponseData = {
  checkin_id: string;
  user_id: string;
  status?: CHECKIN_RESPONSE_STATUS;
  responded_at?: string;
};

export { CheckinResponse, CreateCheckinResponseData, CHECKIN_RESPONSE_STATUS };
