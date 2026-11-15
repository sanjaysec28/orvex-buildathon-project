export type TextDirection = 'ltr' | 'rtl';

export type TranslationCoverage = 'baseline' | 'fallback_pending';

export type SupportedLanguageCode =
  | 'en'
  | 'as'
  | 'bn'
  | 'brx'
  | 'doi'
  | 'gu'
  | 'hi'
  | 'kn'
  | 'ks'
  | 'kok'
  | 'mai'
  | 'ml'
  | 'mni'
  | 'mr'
  | 'ne'
  | 'or'
  | 'pa'
  | 'sa'
  | 'sat'
  | 'sd'
  | 'ta'
  | 'te'
  | 'ur';

export interface LanguageDefinition {
  code: SupportedLanguageCode;
  englishName: string;
  nativeName: string;
  symbol: string;
  scriptName: string;
  direction: TextDirection;
  isScheduledIndianLanguage: boolean;
  coverage: TranslationCoverage;
}
