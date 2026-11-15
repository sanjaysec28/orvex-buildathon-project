import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { persistLanguage } from '../../i18n/config';
import { getTextDirection, isSupportedLanguageCode } from '../../utils/languageUtils';
import { LanguageList } from './LanguageList';
import { useLanguagePreferences } from './useLanguagePreferences';

export function LanguageSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, allLanguages, selectLanguage } = useLanguagePreferences();

  const handleContinue = async () => {
    if (!isSupportedLanguageCode(currentLanguage.code)) {
      return;
    }
    persistLanguage(currentLanguage.code);
    await selectLanguage(currentLanguage.code);
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = getTextDirection(currentLanguage.code);
    navigate('/role');
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[#EAF6FF] via-[#F6FBFF] to-[#F6FBFF] text-[#18364B] flex flex-col">
      {/* Subtle decorative corner shapes positioned clear of foreground text */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 140"
        className="pointer-events-none absolute top-0 start-0 w-16 sm:w-24 h-auto text-[#C8F542]"
        fill="currentColor"
      >
        <path d="M0,0 L34,0 C52,32 76,62 96,90 C62,74 30,48 0,18 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none absolute top-24 end-0 w-16 sm:w-24 h-auto text-[#73CFFF]/65"
        fill="currentColor"
      >
        <path d="M120,0 C84,12 52,36 32,74 C66,60 94,48 120,42 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 inset-x-0 w-full h-9 sm:h-12"
      >
        <path
          d="M0,18 C65,24 115,46 168,70 L0,70 Z"
          fill="#73CFFF"
        />
        <path
          d="M150,70 C245,42 330,18 400,8 L400,70 Z"
          fill="#C8F542"
        />
      </svg>

      {/* Main centred column */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-[460px] mx-auto px-4 sm:px-6 flex flex-col">
        {/* Compact branding & centred headings */}
        <header className="pt-5 sm:pt-7 pb-3 text-center shrink-0">
          <div
            dir="ltr"
            className="inline-flex items-center justify-center"
            aria-label={t('brand.name')}
          >
            <svg viewBox="0 0 142 38" className="h-8 sm:h-9 w-auto" role="img" aria-label="ORVEX">
              <text
                x="4"
                y="30"
                fill="#18364B"
                fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                fontWeight="800"
                fontSize="32"
                letterSpacing="-0.03em"
              >
                ORVE
              </text>
              <path
                d="M97 6 L112 20 L97 32 L104 32 L115 22 L125 32 L133 32 L119 19 L132 6 L125 6 L115 16 L105 6 Z"
                fill="#18364B"
              />
              <path d="M97 6 L112 20 L115 17 L105 6 Z" fill="#C8F542" />
              <path d="M132 6 L114 23 L104 32 L111 32 L121 21 L132 6 Z" fill="#73CFFF" />
            </svg>
          </div>

          <p className="mt-1.5 text-[16px] sm:text-[17px] font-bold italic leading-[1.3] text-[#18364B] max-w-[205px] mx-auto">
            {t('brand.tagline')}
          </p>

          <svg
            aria-hidden="true"
            viewBox="0 0 180 12"
            className="mx-auto mt-1.5 w-32 h-2.5"
            fill="none"
          >
            <path
              d="M6 9 C58 2, 122 2, 174 6"
              stroke="#C8F542"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          </svg>

          <h1 className="mt-3.5 text-[23px] sm:text-[26px] leading-[1.28] font-bold tracking-tight text-[#18364B]">
            {t('language.title')}
          </h1>
          <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#4A6578]">
            {t('language.subtitle')}
          </p>
        </header>

        {/* Scrollable search + 2-column language cards */}
        <main className="flex-1 min-h-0 overflow-y-auto pb-3 pe-0.5">
          <LanguageList
            languages={allLanguages}
            selectedCode={currentLanguage.code}
            onSelect={selectLanguage}
          />
        </main>

        {/* Fixed bottom Continue CTA */}
        <footer className="shrink-0 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-[54px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] text-[#18364B] font-bold text-[16px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2"
          >
            <span>{t('language.continue')}</span>
            <ArrowRight className="w-5 h-5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </footer>
      </div>
    </div>
  );
}
