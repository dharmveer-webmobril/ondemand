import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { spanish } from "./spanish";
import { english } from "./english";
import { arabic } from "./arabic";
import { I18nManager } from "react-native";

// Define the type for translation resources
const resources = {
  en: { translation: english },
  sp: { translation: spanish },
  ar: { translation: arabic },
};

// Initialize i18next with TypeScript support
i18next
  .use(initReactI18next)
  .init({
    lng: I18nManager.isRTL ? "ar" : "en", // Get device language or default to English
    fallbackLng: "en", // Default language if translation is missing
    resources, // Language resources
    interpolation: {
      escapeValue: false, // React already escapes text
    },
  });

export default i18next;
