import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const googleSheetsClientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const googleSheetsPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const googleSheetsSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const adminToken = process.env.ADMIN_TOKEN;
const checkinTime = process.env.CHECKIN_TIME;
const reminderDelayHours = process.env.REMINDER_DELAY_HOURS;
const dailyReportTime = process.env.DAILY_REPORT_TIME;
const dailyReportTimezone = process.env.DAILY_REPORT_TIMEZONE;
const dailyReportRecipient = process.env.DAILY_REPORT_RECIPIENT;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;
const dailyReportCron = process.env.DAILY_REPORT_CRON;

const port = Number(process.env.PORT);

if (!PORT) {
  throw new Error("PORT is not defined");
}

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a valid positive integer");
}

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not defined");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_KEY is not defined");
}

if (!supabasePublishableKey) {
  throw new Error("SUPABASE_PUBLISHABLE_KEY is not defined");
}

if (!googleSheetsClientEmail) {
  throw new Error("GOOGLE_SHEETS_CLIENT_EMAIL is not defined");
}

if (!googleSheetsPrivateKey) {
  throw new Error("GOOGLE_SHEETS_PRIVATE_KEY is not defined");
}

if (!googleSheetsSpreadsheetId) {
  throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not defined");
}

if (!slackBotToken) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}

if (!slackSigningSecret) {
  throw new Error("SLACK_SIGNING_SECRET is not defined");
}

if (!adminToken) {
  throw new Error("ADMIN_TOKEN is not defined");
}

if (!checkinTime) {
  throw new Error("CHECKIN_TIME is not defined");
}

if (!reminderDelayHours) {
  throw new Error("REMINDER_DELAY_HOURS is not defined");
}

if (!dailyReportTime) {
  throw new Error("DAILY_REPORT_TIME is not defined");
}

if (!dailyReportTimezone) {
  throw new Error("DAILY_REPORT_TIMEZONE is not defined");
}

if (!dailyReportRecipient) {
  throw new Error("DAILY_REPORT_RECIPIENT is not defined");
}

if (!smtpHost) {
  throw new Error("SMTP_HOST is not defined");
}

if (!smtpPort) {
  throw new Error("SMTP_PORT is not defined");
}

// if (!smtpSecure) {
//   throw new Error("SMTP_SECURE is not defined");
// }

if (!smtpUser) {
  throw new Error("SMTP_USER is not defined");
}

if (!smtpPassword) {
  throw new Error("SMTP_PASSWORD is not defined");
}

if (!emailFrom) {
  throw new Error("EMAIL_FROM is not defined");
}

if (!dailyReportCron) {
  throw new Error("DAILY_REPORT_CRON is not defined");
}

export const envConfig = {
  port,
  supabaseUrl,
  supabaseServiceKey,
  supabasePublishableKey,
  googleSheetsClientEmail,
  googleSheetsPrivateKey,
  googleSheetsSpreadsheetId,
  slackBotToken,
  slackSigningSecret,
  adminToken,
  checkinTime,
  reminderDelayHours,
  dailyReportTime,
  dailyReportTimezone,
  dailyReportRecipient,
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPassword,
  emailFrom,
  dailyReportCron,
};
