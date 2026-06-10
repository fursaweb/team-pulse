import { LANG } from "../../types/user.types";

export type TranslationKey =
  | "checkin.dailyMessage"
  | "checkin.safeButton"
  | "checkin.reminderMessage"
  | "checkin.confirmationMessage"
  | "checkin.duplicateResponse"
  | "checkin.userNotFound"
  | "checkin.closedCheckin";

export type Translations = Record<TranslationKey, string>;

export type SupportedLanguage = LANG.UK | LANG.EN;
