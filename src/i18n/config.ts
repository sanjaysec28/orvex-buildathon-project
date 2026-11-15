import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enTranslation } from './locales/en';
import { hiTranslation } from './locales/hi';
import { knTranslation } from './locales/kn';
import {
  DEFAULT_LANGUAGE_CODE,
  LANGUAGE_STORAGE_KEY,
  ORVEX_LANGUAGES,
} from './locales/languages';
import { taTranslation } from './locales/ta';
import { urTranslation } from './locales/ur';
import { resolveInitialLanguage } from '../utils/languageUtils';
import type { SupportedLanguageCode } from '../types/i18n';

function readStoredLanguage(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
  } catch {
    return null;
  }
}

export function persistLanguage(code: SupportedLanguageCode): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    }
  } catch {
    // Storage unavailable in restricted context
  }
}

const initialLanguage = resolveInitialLanguage(readStoredLanguage());

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  ta: { translation: taTranslation },
  kn: { translation: knTranslation },
  ur: { translation: urTranslation },
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE_CODE,
    supportedLngs: ORVEX_LANGUAGES.map((l) => l.code),
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

export default i18n;
