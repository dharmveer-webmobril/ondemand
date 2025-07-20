import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import { english } from "./english";
import { frenchCanada } from "./frenchCanada";
import { portuguese } from "./portuguese";
import { spanish } from "./spanish";

const resources = {
  en: { translation: english },
  sp: { translation: spanish },
  frcd: { translation: frenchCanada },
  pt: { translation: portuguese },
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

export default i18next;
