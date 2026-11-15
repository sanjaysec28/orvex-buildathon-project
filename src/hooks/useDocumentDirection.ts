import { useEffect } from 'react';
import { getLanguageByCode } from '../utils/languageUtils';

export function useDocumentDirection(languageCode: string): void {
  const language = getLanguageByCode(languageCode);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = language.direction;
    root.lang = language.code;
  }, [language.code, language.direction]);
}
