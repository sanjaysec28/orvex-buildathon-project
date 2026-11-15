import { Globe, LogOut, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LanguageSwitcherModal } from '../../components/ui/LanguageSwitcherModal';
import { cn } from '../../utils/cn';
import { DemoModeBanner } from '../demo/DemoModeBanner';
import { OrvexWordmark } from '../transporterDashboard/components/OrvexDarkLogo';
import { getInitials } from '../transporterDashboard/transporterDashboardUtils';
import { useShipperSession } from './ShipperAuthGuard';
import { SHIPPER_NAV_ITEMS } from './shipperNav';

export interface ShipperWorkspaceShellProps {
  pageTitle: string;
  children: ReactNode;
}

export function ShipperWorkspaceShell({ pageTitle, children }: ShipperWorkspaceShellProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { session, logout } = useShipperSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const initials = getInitials(session.displayName);

  return (
    <div className="min-h-screen bg-[#F2F8FD] text-[#18364B] flex">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Shipper navigation sidebar"
        className="hidden md:flex flex-col w-[240px] shrink-0 bg-[#0D253C] text-white border-r border-[#183856] select-none"
      >
        <div className="h-16 px-5 flex items-center border-b border-white/10 shrink-0">
          <Link to="/shipper" aria-label="ORVEX Shipper Dashboard">
            <OrvexWordmark variant="dark-bg" />
          </Link>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-1" aria-label="Shipper primary sections">
          {SHIPPER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.end ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] min-h-[42px] transition-colors',
                  active
                    ? 'bg-[#C8F542] text-[#0D253C] font-bold shadow-[0_4px_12px_rgba(200,245,66,0.22)]'
                    : 'text-[#DCEBFA] font-medium hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon
                  className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-[#0D253C]' : 'text-[#A9CBE8]')}
                  aria-hidden="true"
                />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1.5">
          <button
            type="button"
            onClick={() => setLanguageModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DCEBFA] hover:bg-white/10 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#A9CBE8]" aria-hidden="true" />
            <span>Language</span>
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FCA5A5] hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-white/95 backdrop-blur border-b border-[#DCEAF4] px-3.5 md:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open shipper navigation menu"
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#18364B] hover:bg-[#EAF4FB] cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <h1 className="hidden md:block text-[18px] font-bold text-[#18364B] truncate">
              {pageTitle}
            </h1>
          </div>

          <Link to="/shipper" className="md:hidden inline-flex items-center">
            <OrvexWordmark variant="light-bg" className="text-[22px]" />
          </Link>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 pr-1">
              <span className="w-9 h-9 rounded-full bg-[#DCEEFB] text-[#18364B] font-bold text-xs inline-flex items-center justify-center">
                {initials}
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-[#18364B]">{session.displayName}</p>
                <p className="text-[11px] font-medium text-[#5A7486]">
                  {session.accountTypeLabel ?? 'Shipper'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="h-9 px-3.5 rounded-full border border-[#DCEAF4] bg-white hover:bg-[#FEF3F2] hover:border-[#F5B5B5] text-xs font-bold text-[#B42318] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 px-3.5 sm:px-5 lg:px-6 py-4 pb-24 md:pb-6 max-w-[1440px] w-full mx-auto space-y-4">
          {session.isDemo ? (
            <DemoModeBanner
              roleLabel="Shipper"
              accountName={session.displayName}
              accountType={session.accountTypeLabel}
              onExitDemo={() => void logout()}
            />
          ) : null}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav
        aria-label="Shipper mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#DCEAF4] px-2 py-1.5 flex items-center justify-around"
      >
        {SHIPPER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.end ? pathname === item.path : pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold',
                active ? 'bg-[#D8FA7B] text-[#18364B]' : 'text-[#4A6578]',
              )}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen ? (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#0D253C]/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[82vw] bg-[#0D253C] text-white p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <OrvexWordmark variant="dark-bg" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <nav className="space-y-1">
                {SHIPPER_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = item.end ? pathname === item.path : pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold',
                        active ? 'bg-[#C8F542] text-[#0D253C]' : 'text-[#DCEBFA] hover:bg-white/10',
                      )}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLanguageModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DCEBFA] hover:bg-white/10 cursor-pointer"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>Language</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FCA5A5] hover:bg-white/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <LanguageSwitcherModal
        open={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
    </div>
  );
}
