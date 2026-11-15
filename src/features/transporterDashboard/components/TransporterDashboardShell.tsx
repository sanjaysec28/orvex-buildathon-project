import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LanguageSwitcherModal } from '../../../components/ui/LanguageSwitcherModal';
import {
  fetchTransporterNotifications,
  markNotificationsRead,
} from '../../../services/transporter/transporterDashboardService';
import { DemoModeBanner } from '../../demo/DemoModeBanner';
import type { TransporterNotification } from '../transporterDashboardTypes';
import { useTransporterSession } from './TransporterAuthGuard';
import { TransporterMobileBottomNav } from './TransporterMobileBottomNav';
import { TransporterMobileDrawer } from './TransporterMobileDrawer';
import { TransporterSidebar } from './TransporterSidebar';
import { TransporterTopBar } from './TransporterTopBar';

export interface TransporterDashboardShellProps {
  pageTitle: string;
  children: ReactNode;
  initialNotifications?: TransporterNotification[];
  initialUnreadCount?: number;
}

export function TransporterDashboardShell({
  pageTitle,
  children,
  initialNotifications,
  initialUnreadCount,
}: TransporterDashboardShellProps) {
  const { session, logout } = useTransporterSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<TransporterNotification[]>(
    initialNotifications ?? [],
  );
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount ?? 0);

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
    void fetchTransporterNotifications().then((res) => {
      if (!active || !res.ok) return;
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    });
    return () => {
      active = false;
    };
  }, [initialNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    const res = await markNotificationsRead('all');
    if (res.ok) {
      setUnreadCount(res.data.unreadCount);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F8FD] text-[#18364B] flex">
      <TransporterSidebar
        collapsed={sidebarCollapsed}
        unreadNotificationCount={unreadCount}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TransporterTopBar
          pageTitle={pageTitle}
          profile={session}
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
              roleLabel="Transporter"
              accountName={session.displayName}
              accountType={session.accountTypeLabel}
              onExitDemo={() => void logout()}
            />
          ) : null}
          {children}
        </main>
      </div>

      <TransporterMobileBottomNav />

      <TransporterMobileDrawer
        open={mobileDrawerOpen}
        profile={session}
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
