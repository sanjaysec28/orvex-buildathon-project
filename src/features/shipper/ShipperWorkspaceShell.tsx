import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LanguageSwitcherModal } from '../../components/ui/LanguageSwitcherModal';
import {
  fetchShipperDashboard,
  markShipperNotificationsRead,
} from '../../services/transporter/transporterDashboardService';
import { DemoModeBanner } from '../demo/DemoModeBanner';
import type { TransporterNotification } from '../transporterDashboard/transporterDashboardTypes';
import { useShipperSession } from './ShipperAuthGuard';
import { ShipperMobileBottomNav } from './ShipperMobileBottomNav';
import { ShipperMobileDrawer } from './ShipperMobileDrawer';
import { ShipperSidebar } from './ShipperSidebar';
import { ShipperTopBar } from './ShipperTopBar';

export interface ShipperWorkspaceShellProps {
  pageTitle: string;
  children: ReactNode;
  initialNotifications?: TransporterNotification[];
  initialUnreadCount?: number;
  businessDisplayName?: string;
}

export function ShipperWorkspaceShell({
  pageTitle,
  children,
  initialNotifications,
  initialUnreadCount,
  businessDisplayName,
}: ShipperWorkspaceShellProps) {
  const { session, logout } = useShipperSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<TransporterNotification[]>(
    initialNotifications ?? [],
  );
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount ?? 0);

  const resolvedBusinessName =
    businessDisplayName ?? session.companyName ?? session.displayName;

  useEffect(() => {
    if (initialNotifications !== undefined) {
      setNotifications(initialNotifications);
    }
    if (initialUnreadCount !== undefined) {
      setUnreadCount(initialUnreadCount);
    }
  }, [initialNotifications, initialUnreadCount]);

  useEffect(() => {
    if (initialNotifications !== undefined) return;
    let active = true;
    void fetchShipperDashboard().then((res) => {
      if (!active || !res.ok) return;
      setNotifications(res.data.overview.notifications ?? []);
      setUnreadCount(res.data.overview.unreadNotificationCount ?? 0);
    });
    return () => {
      active = false;
    };
  }, [initialNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    const res = await markShipperNotificationsRead('all');
    if (res.ok) {
      setUnreadCount(res.data.unreadCount);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F8FD] text-[#18364B] flex">
      <ShipperSidebar
        collapsed={sidebarCollapsed}
        unreadNotificationCount={unreadCount}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <ShipperTopBar
          pageTitle={pageTitle}
          profile={session}
          businessDisplayName={resolvedBusinessName}
          notifications={notifications}
          unreadNotificationCount={unreadCount}
          sidebarCollapsed={sidebarCollapsed}
          onToggleDesktopSidebar={() => setSidebarCollapsed((c) => !c)}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          onMarkAllRead={handleMarkAllRead}
          onOpenLanguageSwitcher={() => setLanguageModalOpen(true)}
          onLogout={logout}
        />

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

      <ShipperMobileBottomNav />

      <ShipperMobileDrawer
        open={mobileDrawerOpen}
        profile={session}
        businessDisplayName={resolvedBusinessName}
        unreadNotificationCount={unreadCount}
        onClose={() => setMobileDrawerOpen(false)}
        onOpenLanguageSwitcher={() => setLanguageModalOpen(true)}
        onLogout={logout}
      />

      <LanguageSwitcherModal
        open={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
    </div>
  );
}
