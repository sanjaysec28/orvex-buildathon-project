import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLanguagePreferences } from '../../features/language/useLanguagePreferences';
import { BrandWordmark } from '../ui';

export interface TopBarProps {
  workspaceLabel: string;
  onOpenLanguageSwitcher: () => void;
}

export function TopBar({ workspaceLabel, onOpenLanguageSwitcher }: TopBarProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguagePreferences();

  return (
    <header className="sticky top-0 z-30 h-[var(--orvex-topbar-height)] md:hidden bg-[var(--orvex-surface-card)] border-b border-[var(--orvex-border-subtle)] px-4 flex items-center justify-between gap-3">
      <Link
        to="/"
        aria-label={t('brand.name')}
        className="flex items-center gap-2 min-w-0"
      >
        <BrandWordmark size="sm" />
      </Link>

      <span className="text-xs font-semibold text-[var(--orvex-text-secondary)] truncate">
        {workspaceLabel}
      </span>

      <button
        type="button"
        onClick={onOpenLanguageSwitcher}
        aria-label={`${t('language.changeLanguage')}: ${currentLanguage.nativeName}`}
        className="min-h-[var(--orvex-touch-min)] px-3 rounded-[var(--orvex-radius-control)] bg-[var(--orvex-surface-subtle)] text-[var(--orvex-text-primary)] text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 hover:bg-[var(--orvex-action-secondary-hover)] cursor-pointer"
      >
        <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="max-w-[76px] truncate">{currentLanguage.nativeName}</span>
      </button>
    </header>
  );
}
