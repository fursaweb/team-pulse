import { LANG } from "../../types/user.types";
import { en } from "./en";
import { uk } from "./uk";
import { SupportedLanguage, TranslationKey, Translations } from "./types";

const translations: Record<SupportedLanguage, Translations> = {
  [LANG.UK]: uk,
  [LANG.EN]: en,
};

export function t(language: SupportedLanguage, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations[LANG.UK][key];
}
