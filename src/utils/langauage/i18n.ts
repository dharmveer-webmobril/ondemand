import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { configureCalendarLocale } from "../calendarLocale";

import { english } from "./english";
import frenchCanada from "./frenchCanada";
import portuguese from "./portuguese";
import spanish from "./spanish";
import hindi from "./hindi";
import { deepMergeTranslations } from "./mergeTranslations";

/** Map app language codes to BCP 47 tags for Intl date/number formatting */
export const mapI18nLanguageToIntlLocale = (lang: string): string => {
  switch (lang) {
    case "sp":
      return "es";
    case "frcd":
      return "fr-CA";
    case "pt":
      return "pt";
    case "hn":
      return "hi";
    case "en":
    default:
      return "en";
  }
};

/**
 * English is the source of truth. Locale files are merged on top so any
 * missing key falls back to English instead of showing the raw key in the UI.
 */
const resources = {
  en: { translation: english },
  sp: { translation: deepMergeTranslations(english, spanish) },
  frcd: { translation: deepMergeTranslations(english, frenchCanada) },
  pt: { translation: deepMergeTranslations(english, portuguese) },
  hn: { translation: deepMergeTranslations(english, hindi) },
};

i18next
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

configureCalendarLocale(i18next.language || "en");

export default i18next;
