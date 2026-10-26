import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation files
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ur from "./locales/ur.json";

i18n
  .use(LanguageDetector) // 👈 Auto-detect browser language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ur: { translation: ur },
    },
    fallbackLng: "en", // Default if user’s language isn’t available
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // 👇 Configure detection order
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"], // Save choice in localStorage
    },
  });

export default i18n;
