import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import {
  TRANSPORTER_MOBILE_BOTTOM_ITEMS,
  isTransporterPathActive,
} from './transporterDashboardNav';

export function TransporterMobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#DCEAF4] shadow-[0_-6px_20px_-6px_rgba(24,54,75,0.1)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <ul className="grid grid-cols-5 gap-1">
        {TRANSPORTER_MOBILE_BOTTOM_ITEMS.map((item) => {
          const active = isTransporterPathActive(pathname, item.to, item.matchExact);
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-2xl min-h-[48px] transition-colors',
                  active
                    ? 'bg-[#C8F542] text-[#18364B] font-bold'
                    : 'text-[#4A6578] font-medium hover:bg-[#F3F9FD]',
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                <span className="text-[11px] leading-tight truncate max-w-full">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
