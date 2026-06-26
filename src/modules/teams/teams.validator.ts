import * as z from "zod";

const teamSyncRowSchema = z.object({
  name: z.string().trim().nonempty("Team name is required").max(100),
  timezone: z.string().trim().nonempty("Timezone is required"),
  check_in_time: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format. Use HH:mm"),
  reminder_delay_hours: z.number().int().min(1).max(24),
  active: z.boolean(),
});

type TeamSyncRow = z.infer<typeof teamSyncRowSchema>;

export { teamSyncRowSchema, TeamSyncRow };
