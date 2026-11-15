import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageList } from '../../features/language/LanguageList';
import { useLanguagePreferences } from '../../features/language/useLanguagePreferences';
import type { SupportedLanguageCode } from '../../types/i18n';

export interface LanguageSwitcherModalProps {
  open: boolean;
  onClose: () => void;
}

export function LanguageSwitcherModal({ open, onClose }: LanguageSwitcherModalProps) {
  const { t } = useTranslation();
  const { currentLanguage, allLanguages, selectLanguage } = useLanguagePreferences();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSelect = async (code: SupportedLanguageCode) => {
    await selectLanguage(code);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--orvex-surface-overlay)] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-switcher-title"
    >
      <div className="w-full sm:max-w-2xl max-h-[85vh] flex flex-col rounded-t-[var(--orvex-radius-sheet)] sm:rounded-[var(--orvex-radius-card)] bg-[var(--orvex-surface-canvas)] border border-[var(--orvex-border-subtle)] shadow-[var(--orvex-shadow-dialog)] overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-5 py-4 bg-[var(--orvex-surface-card)] border-b border-[var(--orvex-border-subtle)]">
          <div className="min-w-0">
            <h2
              id="language-switcher-title"
              className="text-[var(--orvex-text-lg)] font-bold text-[var(--orvex-text-primary)]"
            >
              {t('language.modalTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--orvex-text-secondary)] mt-0.5">
              {t('language.modalSubtitle')}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('language.closeModal')}
            className="min-h-[var(--orvex-touch-min)] min-w-[var(--orvex-touch-min)] flex items-center justify-center rounded-[var(--orvex-radius-control)] text-[var(--orvex-text-primary)] hover:bg-[var(--orvex-surface-subtle)] shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto">
          <LanguageList
            languages={allLanguages}
            selectedCode={currentLanguage.code}
            onSelect={handleSelect}
            compact
          />
        </div>
      </div>
    </div>
  );
}
