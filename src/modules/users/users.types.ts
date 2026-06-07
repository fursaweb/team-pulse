import { TEAM_MEMBER_ROLE } from "../../types/teamMember.type";
import { LANG } from "../../types/user.types";

export type UserSyncRow = {
  email: string;
  name: string;
  team_name: string;
  language: LANG;
  team_role: TEAM_MEMBER_ROLE;
  active: boolean;
};
