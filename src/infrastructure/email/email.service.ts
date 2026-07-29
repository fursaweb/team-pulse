import { dailyReportService } from "../../modules/reports/dailyReport.service";
import { buildDailyReportEmail } from "../../modules/reports/dailyReport.template";
import { transporter } from "../../infrastructure/email/smpt.client";
import { logger } from "../logger/logger";
import { envConfig } from "../../config/env";
import { DailyReportEmail } from "../../modules/reports/dailyReport.types";

class EmailService {
  private async sendEmail(report: DailyReportEmail, reportDate: string) {
    try {
      const info = await transporter.sendMail({
        from: '"Team pulse" <team-pulse@cfsss.org>',
        to: envConfig.dailyReportRecipient,
        subject: report.subject,
        text: report.text,
        html: report.html,
      });

      logger.info("EmailService", "Daily report sent", {
        date: reportDate,
        messageId: info.messageId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown SMTP error";

      logger.error("EmailService", "Failed to send daily report", {
        error: errorMessage,
      });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(errorMessage);
    }
  }

  async sendDailyReport(date: string) {
    const report = await dailyReportService.buildDailyReport(date);
    const dailyReportEmail = buildDailyReportEmail(report);
    await this.sendEmail(dailyReportEmail, date);
  }
}

export const emailService = new EmailService();
