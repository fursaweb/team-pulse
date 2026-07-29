enum REPORT_STATUS {
  CHECKIN_NOT_CREATED = "CHECKIN_NOT_CREATED",
  CHECKIN_FAILED = "CHECKIN_FAILED",
  ALL_RESPONDED = "ALL_RESPONDED",
  HAS_NON_RESPONDERS = "HAS_NON_RESPONDERS",
}

type NonResponder = {
  userId: string;
  name: string;
  email: string;
};

type TeamReport = {
  teamId: string;
  teamName: string;
  status: REPORT_STATUS;
  checkinId: string | null;
  totalMembers: number;
  respondedCount: number;
  nonResponderCount: number;
  nonResponders: NonResponder[];
};

type DailyReportTotals = {
  totalTeams: number;
  totalMembers: number;
  respondedCount: number;
  nonResponderCount: number;
  teamsWithoutCheckinCount: number;
  failedCheckinCount: number;
};

type DailyReport = {
  reportDate: string;
  generatedAt: string;
  teams: TeamReport[];
  totals: DailyReportTotals;
};

export {
  REPORT_STATUS,
  NonResponder,
  TeamReport,
  DailyReportTotals,
  DailyReport,
};
