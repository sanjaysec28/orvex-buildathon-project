import { ArrowLeftRight, Globe, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { useLanguagePreferences } from '../../features/language/useLanguagePreferences';
import type { NavItemConfig } from '../../types/navigation';
import type { UserRole } from '../../types/domain';
import { cn } from '../../utils/cn';
import { getOppositeRole, getWorkspaceBasePath } from '../../utils/roleRouting';
import { BrandWordmark } from '../ui';

export interface DesktopSidebarProps {
  role: UserRole;
  workspaceLabel: string;
  items: readonly NavItemConfig[];
  onSwitchRole: (nextRole: UserRole) => void;
  onOpenLanguageSwitcher: () => void;
}

export function DesktopSidebar({
  role,
  workspaceLabel,
  items,
  onSwitchRole,
  onOpenLanguageSwitcher,
}: DesktopSidebarProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguagePreferences();
  const oppositeRole = getOppositeRole(role);
  const oppositePath = getWorkspaceBasePath(oppositeRole);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 bg-white border-e border-[#D2E7F4] min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-[#D2E7F4] space-y-2">
        <Link to="/" className="inline-flex items-center">
          <BrandWordmark size="md" />
        </Link>
        <p className="text-xs font-medium text-[#3F5B6E]">
          {workspaceLabel}
        </p>
      </div>

      <nav aria-label={workspaceLabel} className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'min-h-[44px] flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-[#73CFFF]/30 text-[#18364B] font-semibold'
                    : 'text-[#3F5B6E] hover:bg-[#E5F3FA]/70 hover:text-[#18364B] font-medium',
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#D2E7F4] space-y-2">
        <button
          type="button"
          onClick={onOpenLanguageSwitcher}
          className="w-full min-h-[44px] flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#18364B] bg-[#F6FBFF] border border-[#D2E7F4] hover:bg-[#E5F3FA] transition-colors cursor-pointer"
        >
          <span className="inline-flex items-center gap-2.5 min-w-0">
            <Globe className="w-4 h-4 shrink-0 text-[#3F5B6E]" aria-hidden="true" />
            <span className="truncate">{currentLanguage.nativeName}</span>
          </span>
          <span className="text-xs text-[#5A7486] shrink-0">{t('language.changeLanguage')}</span>
        </button>

        <Link
          to={oppositePath}
          onClick={() => onSwitchRole(oppositeRole)}
          className="w-full min-h-[44px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#18364B] hover:bg-[#E5F3FA] transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4 shrink-0 text-[#3F5B6E]" aria-hidden="true" />
          <span className="truncate">
            {oppositeRole === 'shipper'
              ? t('roles.switchToShipper')
              : t('roles.switchToTransporter')}
          </span>
        </Link>

        <Link
          to="/auth"
          className="w-full min-h-[44px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#3F5B6E] hover:bg-[#E5F3FA] hover:text-[#18364B] transition-colors"
        >
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('nav.authFoundation')}</span>
        </Link>
      </div>
    </aside>
  );
}
