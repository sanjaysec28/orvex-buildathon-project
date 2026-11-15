import {
  DEFAULT_LANGUAGE_CODE,
  ORVEX_LANGUAGES,
} from '../i18n/locales/languages';
import type {
  LanguageDefinition,
  SupportedLanguageCode,
  TextDirection,
} from '../types/i18n';

export function isSupportedLanguageCode(value: string | null | undefined): value is SupportedLanguageCode {
  if (!value) return false;
  return ORVEX_LANGUAGES.some((lang) => lang.code === value);
}

export function getLanguageByCode(code: string | null | undefined): LanguageDefinition {
  const match = ORVEX_LANGUAGES.find((lang) => lang.code === code);
  return match ?? ORVEX_LANGUAGES[0];
}

export function getTextDirection(code: string | null | undefined): TextDirection {
  return getLanguageByCode(code).direction;
}

export function isRtlLanguage(code: string | null | undefined): boolean {
  return getTextDirection(code) === 'rtl';
}

export function resolveInitialLanguage(storedValue: string | null | undefined): SupportedLanguageCode {
  return isSupportedLanguageCode(storedValue) ? storedValue : DEFAULT_LANGUAGE_CODE;
}

export function filterLanguages(
  query: string,
  languages: readonly LanguageDefinition[] = ORVEX_LANGUAGES,
): LanguageDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...languages];
  }
  return languages.filter(
    (lang) =>
      lang.englishName.toLowerCase().includes(normalized) ||
      lang.nativeName.toLowerCase().includes(normalized) ||
      lang.scriptName.toLowerCase().includes(normalized) ||
      lang.code.toLowerCase().includes(normalized),
  );
}
