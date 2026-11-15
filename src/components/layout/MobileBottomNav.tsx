import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import type { NavItemConfig } from '../../types/navigation';
import { cn } from '../../utils/cn';

export interface MobileBottomNavProps {
  items: readonly NavItemConfig[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('roles.currentRole')}
      className="fixed bottom-0 inset-x-0 z-30 h-[var(--orvex-bottomnav-height)] md:hidden bg-[var(--orvex-surface-card)] border-t border-[var(--orvex-border-subtle)] shadow-[var(--orvex-shadow-nav)] px-2"
    >
      <ul className="h-full grid grid-cols-3 items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="h-full flex items-center justify-center">
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'min-h-[var(--orvex-touch-min)] w-full rounded-[var(--orvex-radius-control)] flex flex-col items-center justify-center gap-0.5 px-2 transition-colors duration-150',
                    isActive
                      ? 'bg-[var(--orvex-surface-subtle)] text-[var(--orvex-text-primary)] font-semibold'
                      : 'text-[var(--orvex-text-muted)] hover:text-[var(--orvex-text-primary)]',
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="text-[11px] leading-tight whitespace-nowrap truncate max-w-full">
                  {t(item.labelKey)}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
