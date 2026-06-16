import { User } from "./user.types";

enum TEAM_MEMBER_ROLE {
  COORDINATOR = "COORDINATOR",
  MEMBER = "MEMBER",
}

type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TEAM_MEMBER_ROLE;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type TeamMemberWithUser = TeamMember & {
  user: Pick<
    User,
    "id" | "name" | "email" | "slack_user_id" | "language" | "status"
  >;
};

type CreateTeamMemberData = {
  team_id: string;
  user_id: string;
  role?: TEAM_MEMBER_ROLE;
  active?: boolean;
};

type UpdateTeamMemberData = {
  role?: TEAM_MEMBER_ROLE;
  active?: boolean;
};

export {
  TEAM_MEMBER_ROLE,
  TeamMember,
  TeamMemberWithUser,
  CreateTeamMemberData,
  UpdateTeamMemberData,
};
