import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation files
import en from "./locales/en.json";
import fr from "./locales/fr.json"; // Example: French
import ur from "./locales/ur.json"; // Example: Urdu

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ur: { translation: ur },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
