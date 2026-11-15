import { Globe, LogOut, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { OrvexWordmark } from '../transporterDashboard/components/OrvexDarkLogo';
import type { AuthenticatedUserSession } from '../transporterDashboard/transporterDashboardTypes';
import { getInitials } from '../transporterDashboard/transporterDashboardUtils';
import { SHIPPER_SIDEBAR_ITEMS, isShipperPathActive } from './shipperNav';

export interface ShipperMobileDrawerProps {
  open: boolean;
  profile: AuthenticatedUserSession;
  businessDisplayName: string;
  unreadNotificationCount: number;
  onClose: () => void;
  onOpenLanguageSwitcher: () => void;
  onLogout: () => Promise<void>;
}

export function ShipperMobileDrawer({
  open,
  profile,
  businessDisplayName,
  unreadNotificationCount,
  onClose,
  onOpenLanguageSwitcher,
  onLogout,
}: ShipperMobileDrawerProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const initials = profile.isDemo
    ? 'SD'
    : getInitials(businessDisplayName || profile.displayName);

  return (
    <div
      className="fixed inset-0 z-50 md:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Shipper navigation drawer"
    >
      <div
        className="fixed inset-0 bg-[#0D253C]/55 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-[285px] max-w-[85vw] h-full bg-[#0D253C] text-white flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <OrvexWordmark variant="dark-bg" className="text-[21px]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shipper navigation menu"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Business User Strip */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#C8F542] text-[#0D253C] font-extrabold text-xs inline-flex items-center justify-center shrink-0">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{businessDisplayName}</p>
            <p className="text-[11px] text-[#A9CBE8] truncate">
              {profile.isDemo ? 'Demo Verified Shipper' : 'Verified Shipper'}
            </p>
          </div>
        </div>

        {/* All 12 Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1" aria-label="Shipper mobile menu sections">
          {SHIPPER_SIDEBAR_ITEMS.map((item) => {
            const active = isShipperPathActive(pathname, item.to, item.matchExact);
            const Icon = item.icon;
            const badgeCount = item.hasUnreadBadge ? unreadNotificationCount : 0;

            return (
              <Link
                key={item.id}
                to={item.to}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] min-h-[42px]',
                  active
                    ? 'bg-[#C8F542] text-[#0D253C] font-bold'
                    : 'text-[#DCEBFA] font-medium hover:bg-white/10',
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                <span className="truncate flex-1">{item.label}</span>
                {badgeCount > 0 ? (
                  <span
                    className={cn(
                      'min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center tabular-nums',
                      active ? 'bg-[#0D253C] text-[#C8F542]' : 'bg-[#C8F542] text-[#0D253C]',
                    )}
                  >
                    {badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLanguageSwitcher();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#DCEBFA] hover:bg-white/10 cursor-pointer"
          >
            <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Change Language</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              void onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#FCA5A5] hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
