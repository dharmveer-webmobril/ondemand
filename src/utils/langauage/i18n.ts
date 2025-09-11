import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import { english } from "./english";
import { frenchCanada } from "./frenchCanada";
import { portuguese } from "./portuguese";
import { spanish } from "./spanish";
import { hindi } from "./hindi";

const resources = {
  en: { translation: english },
  sp: { translation: spanish },
  frcd: { translation: frenchCanada },
  pt: { translation: portuguese },
  hn: { translation: hindi },
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
