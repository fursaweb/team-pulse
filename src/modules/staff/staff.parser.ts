import { SyncErrorData } from "../../infrastructure/google/googleShets.types";
import {
  StaffParseResult,
  staffEmailSchema,
  staffRowSchema,
} from "./staff.schema";

const parseStaffEmail = (rawEmail: string): string => {
  const emails = rawEmail
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const cfsssEmails = emails.filter((email) => email.endsWith("@cfsss.org"));

  if (cfsssEmails.length === 1) {
    return cfsssEmails[0];
  }

  return rawEmail.trim().toLowerCase();
};

const parseStaffRow = (row: string[], rowIndex: number) => {
  const parsedRow = {
    rowNumber: rowIndex + 3,
    name: row[2] ?? "",
    email: parseStaffEmail(row[6] ?? ""),
    teamName: row[8] ?? "",
  };

  return staffRowSchema.safeParse(parsedRow);
};

const parseStaffRows = (rows: string[][]): StaffParseResult => {
  const staffParseResult: StaffParseResult = {
    validRows: [],
    errors: [],
    observedEmails: new Set<string>(),
  };

  const seenEmails = new Set<string>();
  const duplicateEmails = new Set<string>();

  for (const [index, row] of rows.entries()) {
    const result = parseStaffRow(row, index);

    const parsedEmail = (row[6] ?? "").trim().toLowerCase();

    if (!result.success) {
      const emailResult = staffEmailSchema.safeParse(parsedEmail);

      if (emailResult.success) {
        staffParseResult.observedEmails.add(emailResult.data);
      }

      const syncErrorData: SyncErrorData = {
        sheet_name: "SSS_Team",
        row_number: index + 2,
        email: parsedEmail,
        team_name: (row[8] ?? "").trim(),
        error_type: "VALIDATION_ERROR",
        error_message: result.error.issues
          .map((issue) => issue.message)
          .join("; "),
        raw_data: JSON.stringify(row),
      };

      staffParseResult.errors.push(syncErrorData);
      continue;
    }

    const validRow = result.data;

    if (duplicateEmails.has(validRow.email)) {
      staffParseResult.errors.push({
        sheet_name: "SSS_Team",
        row_number: validRow.rowNumber,
        email: validRow.email,
        team_name: validRow.teamName,
        error_type: "VALIDATION_ERROR",
        error_message: "Duplicate email",
        raw_data: JSON.stringify(row),
      });

      staffParseResult.observedEmails.add(validRow.email);
      continue;
    }

    if (seenEmails.has(validRow.email)) {
      const existingRow = staffParseResult.validRows.find(
        (item) => item.email === validRow.email,
      );

      const isSameStaffRecord =
        existingRow &&
        existingRow.name === validRow.name &&
        existingRow.teamName === validRow.teamName;

      if (isSameStaffRecord) {
        continue;
      }

      duplicateEmails.add(validRow.email);

      const firstDuplicateIndex = staffParseResult.validRows.findIndex(
        (item) => item.email === validRow.email,
      );

      if (firstDuplicateIndex !== -1) {
        const firstDuplicate = staffParseResult.validRows[firstDuplicateIndex];

        staffParseResult.validRows.splice(firstDuplicateIndex, 1);

        staffParseResult.errors.push({
          sheet_name: "SSS_Team",
          row_number: firstDuplicate.rowNumber,
          email: firstDuplicate.email,
          team_name: firstDuplicate.teamName,
          error_type: "VALIDATION_ERROR",
          error_message: "Duplicate email",
          raw_data: JSON.stringify(firstDuplicate),
        });
      }

      staffParseResult.errors.push({
        sheet_name: "SSS_Team",
        row_number: validRow.rowNumber,
        email: validRow.email,
        team_name: validRow.teamName,
        error_type: "VALIDATION_ERROR",
        error_message: "Duplicate email",
        raw_data: JSON.stringify(row),
      });

      staffParseResult.observedEmails.add(validRow.email);
      continue;
    }

    seenEmails.add(validRow.email);
    staffParseResult.validRows.push(validRow);
    staffParseResult.observedEmails.add(validRow.email);
  }

  return staffParseResult;
};

export { parseStaffRow, parseStaffRows };
