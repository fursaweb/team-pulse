import * as z from "zod";
import { TEAM_MEMBER_ROLE } from "../../types/teamMember.type";
import { LANG } from "../../types/user.types";

const userSyncRowSchema = z.object({
  email: z.email().trim(),
  name: z.string().trim().nonempty("Name is required").max(50),
  team_name: z.string().trim().nonempty("Team name is required").max(100),
  language: z.enum(LANG),
  team_role: z.enum(TEAM_MEMBER_ROLE),
  active: z.boolean(),
});

type UserSyncRow = z.infer<typeof userSyncRowSchema>;

export { userSyncRowSchema, UserSyncRow };
