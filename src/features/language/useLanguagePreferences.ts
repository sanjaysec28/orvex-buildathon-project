import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { persistLanguage } from '../../i18n/config';
import { ORVEX_LANGUAGES } from '../../i18n/locales/languages';
import type { LanguageDefinition, SupportedLanguageCode } from '../../types/i18n';
import { getLanguageByCode } from '../../utils/languageUtils';

export function useLanguagePreferences() {
  const { i18n } = useTranslation();
  const currentLanguage: LanguageDefinition = getLanguageByCode(i18n.language);

  const selectLanguage = useCallback(
    async (code: SupportedLanguageCode) => {
      persistLanguage(code);
      await i18n.changeLanguage(code);
    },
    [i18n],
  );

  return {
    currentLanguage,
    allLanguages: ORVEX_LANGUAGES,
    selectLanguage,
  };
}
