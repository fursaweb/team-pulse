import * as z from "zod";
import { SyncErrorData } from "../../infrastructure/google/googleShets.types";

const staffEmailSchema = z.email();

const staffRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  name: z.string().trim().nonempty("User name is required").max(100),
  email: staffEmailSchema,
  teamName: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || undefined),
});

type StaffRow = z.infer<typeof staffRowSchema>;

type StaffParseResult = {
  validRows: StaffRow[];
  errors: SyncErrorData[];
  observedEmails: Set<string>;
};

export { staffEmailSchema, staffRowSchema, StaffRow, StaffParseResult };
