import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui';
import type { LanguageDefinition, SupportedLanguageCode } from '../../types/i18n';
import { cn } from '../../utils/cn';
import { filterLanguages } from '../../utils/languageUtils';

export interface LanguageListProps {
  languages: readonly LanguageDefinition[];
  selectedCode: SupportedLanguageCode;
  onSelect: (code: SupportedLanguageCode) => void;
  compact?: boolean;
}

export function LanguageList({
  languages,
  selectedCode,
  onSelect,
  compact = false,
}: LanguageListProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filteredLanguages = useMemo(
    () => filterLanguages(query, languages),
    [query, languages],
  );

  const searchInputId = compact ? 'modal-language-search' : 'entry-language-search';

  return (
    <div className="space-y-3.5">
      <div className="sticky top-0 z-10 pt-0.5 pb-1.5 bg-[#F4FAFF]/95 backdrop-blur-[2px]">
        <div className="relative flex items-center">
          <label htmlFor={searchInputId} className="sr-only">
            {t('language.searchLabel')}
          </label>
          <Search
            className="pointer-events-none absolute start-4 w-[18px] h-[18px] text-[#5A7486]"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('language.searchPlaceholder')}
            className="w-full h-[46px] rounded-full bg-white border border-[#DCEAF4] ps-11 pe-11 text-[15px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_4px_rgba(24,54,75,0.03)] transition-colors focus:border-[#38B6FF] focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('language.clearSearch')}
              className="absolute end-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#5A7486] hover:text-[#18364B] hover:bg-[#E5F3FA] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {filteredLanguages.length === 0 ? (
        <div className="rounded-2xl border border-[#DCEAF4] bg-white px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#3F5B6E]">
            {t('language.emptyResults')}
          </p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setQuery('')}>
              {t('language.clearSearch')}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn('grid grid-cols-2 gap-2.5 sm:gap-3')}
          role="listbox"
          aria-label={t('language.title')}
        >
          {filteredLanguages.map((lang) => {
            const isSelected = lang.code === selectedCode;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(lang.code)}
                className={cn(
                  'relative min-h-[64px] w-full flex items-center gap-2.5 rounded-[14px] px-2.5 sm:px-3 py-2.5 text-start border transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2',
                  isSelected
                    ? 'bg-[#E3F5FF] border-[1.5px] border-[#26A7F2] shadow-[0_2px_10px_-2px_rgba(38,167,242,0.18)]'
                    : 'bg-white border-[#E4EFF7] shadow-[0_2px_8px_-2px_rgba(24,54,75,0.05)] hover:border-[#A8D4EC]',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] flex items-center justify-center shrink-0 text-[13px] sm:text-[14px] font-bold text-[#18364B]',
                    isSelected ? 'bg-white' : 'bg-[#EFF7FC]',
                  )}
                >
                  {lang.symbol}
                </span>

                <span className="min-w-0 flex-1 pe-4">
                  <span className="block text-[13.5px] sm:text-[14px] font-bold text-[#18364B] leading-tight truncate">
                    {lang.englishName}
                  </span>
                  <span className="block text-[11.5px] sm:text-[12px] text-[#4A6578] leading-tight mt-0.5 truncate">
                    {lang.nativeName}
                  </span>
                </span>

                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-[#1C9CF0] text-white flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
