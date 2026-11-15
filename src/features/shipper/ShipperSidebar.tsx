import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { OrvexWordmark } from '../transporterDashboard/components/OrvexDarkLogo';
import { ShipperSidebarPromoArt } from './ShipperScenicArt';
import { SHIPPER_SIDEBAR_ITEMS, isShipperPathActive } from './shipperNav';

export interface ShipperSidebarProps {
  collapsed: boolean;
  unreadNotificationCount: number;
}

export function ShipperSidebar({ collapsed, unreadNotificationCount }: ShipperSidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside
      aria-label="Shipper navigation sidebar"
      className={cn(
        'hidden md:flex flex-col shrink-0 bg-[#0D253C] text-white border-r border-[#183856] transition-[width] duration-200 select-none overflow-hidden',
        collapsed ? 'w-[76px]' : 'w-[244px]',
      )}
    >
      {/* Top ORVEX Wordmark */}
      <div
        className={cn(
          'h-16 flex items-center shrink-0 border-b border-white/10',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        <Link
          to="/shipper"
          aria-label="ORVEX Shipper Dashboard"
          className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F542] rounded-lg"
        >
          <OrvexWordmark variant="dark-bg" compact={collapsed} />
        </Link>
      </div>

      {/* 12 Primary Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1" aria-label="Shipper primary sections">
        {SHIPPER_SIDEBAR_ITEMS.map((item) => {
          const active = isShipperPathActive(pathname, item.to, item.matchExact);
          const Icon = item.icon;
          const badgeCount = item.hasUnreadBadge ? unreadNotificationCount : 0;

          return (
            <Link
              key={item.id}
              to={item.to}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center rounded-xl transition-colors text-[13.5px] min-h-[40px]',
                collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                active
                  ? 'bg-[#C8F542] text-[#0D253C] font-bold shadow-[0_4px_12px_rgba(200,245,66,0.22)]'
                  : 'text-[#DCEBFA] font-medium hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0',
                  active ? 'text-[#0D253C]' : 'text-[#A9CBE8] group-hover:text-white',
                )}
                aria-hidden="true"
              />
              {!collapsed ? (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {badgeCount > 0 ? (
                    <span
                      className={cn(
                        'min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center shrink-0 tabular-nums',
                        active
                          ? 'bg-[#0D253C] text-[#C8F542]'
                          : 'bg-[#C8F542] text-[#0D253C]',
                      )}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  ) : null}
                </>
              ) : badgeCount > 0 ? (
                <span
                  aria-label={`${badgeCount} unread notifications`}
                  className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-[#C8F542] ring-2 ring-[#0D253C]"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Promotional Warehouse & Truck Card */}
      {!collapsed ? (
        <div className="p-3 pt-1 shrink-0">
          <Link
            to="/shipper/post"
            className="block rounded-2xl overflow-hidden bg-gradient-to-b from-[#163858] to-[#0A1E31] border border-white/10 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F542]"
          >
            <ShipperSidebarPromoArt />
            <div className="px-3.5 py-2.5 space-y-1 bg-[#0A1E31]">
              <p className="text-[14px] font-extrabold text-white leading-tight">
                Move Your
                <br />
                Business Further
              </p>
              <p className="text-[11px] text-[#BBD7F0] leading-snug">
                Post shipments, find reliable trucks, and deliver on time with ORVEX.
              </p>
            </div>
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
