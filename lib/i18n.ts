import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../messages/en/translation.json';
import translationHI from '../messages/hi/translation.json';
import translationMR from '../messages/mr/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  mr: {
    translation: translationMR,
  },
  hi: {
    translation: translationHI,
  },
};

// Create i18n instance for client-side use
const i18nInstance = i18n.createInstance();

if (typeof window !== 'undefined') {
  i18nInstance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already handles XSS protection
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    });
} else {
  // For SSR, initialize with English as default
  i18nInstance.init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18nInstance;