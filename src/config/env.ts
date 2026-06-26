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

if (!PORT) {
  throw new Error("PORT is not defined");
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

export const envConfig = {
  port: PORT,
  supabaseUrl,
  supabaseServiceKey,
  supabasePublishableKey,
  googleSheetsClientEmail,
  googleSheetsPrivateKey,
  googleSheetsSpreadsheetId,
  slackBotToken,
  slackSigningSecret,
  adminToken,
};
