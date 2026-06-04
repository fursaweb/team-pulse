import { google } from "googleapis";
import { envConfig } from "../../config/env";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: envConfig.googleSheetsClientEmail,
    private_key: envConfig.googleSheetsPrivateKey.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const googleSheetsClient = google.sheets({
  version: "v4",
  auth,
});
