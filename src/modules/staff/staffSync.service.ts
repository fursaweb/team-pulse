import { googleSheetsService } from "../../infrastructure/google/googleSheets.service";
import { logger } from "../../infrastructure/logger/logger";
import { parseStaffRows } from "./staff.parser";

class StaffSyncService {
  async syncStaff() {
    const rows = await googleSheetsService.readStaffSheet();

    const { validRows, errors, observedEmails } = parseStaffRows(rows);

    logger.info("StaffSyncService", "StaffSync report", {
      rowsCount: rows.length,
      validRowsLength: validRows.length,
      errorsLength: errors.length,
      observedEmailsSize: observedEmails.size,
    });
  }
}

export const staffSyncService = new StaffSyncService();
