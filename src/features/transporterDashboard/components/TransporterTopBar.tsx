import {
  Bell,
  CheckCheck,
  ChevronDown,
  FileText,
  Globe,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import type {
  AuthenticatedUserSession,
  TransporterNotification,
} from '../transporterDashboardTypes';
import { getInitials } from '../transporterDashboardUtils';
import { OrvexWordmark } from './OrvexDarkLogo';

export interface TransporterTopBarProps {
  pageTitle: string;
  profile: AuthenticatedUserSession;
  notifications: TransporterNotification[];
  unreadNotificationCount: number;
  sidebarCollapsed: boolean;
  onToggleDesktopSidebar: () => void;
  onOpenMobileDrawer: () => void;
  onMarkAllRead: () => Promise<void>;
  onOpenLanguageSwitcher: () => void;
  onLogout: () => Promise<void>;
}

export function TransporterTopBar({
  pageTitle,
  profile,
  notifications,
  unreadNotificationCount,
  sidebarCollapsed,
  onToggleDesktopSidebar,
  onOpenMobileDrawer,
  onMarkAllRead,
  onOpenLanguageSwitcher,
  onLogout,
}: TransporterTopBarProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const initials = getInitials(profile.displayName);

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-white/95 backdrop-blur border-b border-[#DCEAF4] px-3.5 md:px-6 flex items-center justify-between gap-3 shrink-0">
      {/* Left: Mobile Drawer Button OR Desktop Sidebar Toggle + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          aria-label="Open navigation menu"
          className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#18364B] hover:bg-[#EAF4FB] cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={sidebarCollapsed}
          className="hidden md:inline-flex w-9 h-9 rounded-xl items-center justify-center text-[#18364B] hover:bg-[#EAF4FB] cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <h1 className="hidden md:block text-[16px] lg:text-[20px] font-bold text-[#18364B] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Mobile Centered Brand Wordmark */}
      <Link
        to="/transporter"
        className="md:hidden inline-flex items-center justify-center"
        aria-label="ORVEX Dashboard Home"
      >
        <OrvexWordmark variant="light-bg" className="text-[22px]" />
      </Link>

      {/* Right: Notification Bell + Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen(false);
              setNotifOpen((prev) => !prev);
            }}
            aria-label={`Notifications${unreadNotificationCount > 0 ? `, ${unreadNotificationCount} unread` : ''}`}
            aria-expanded={notifOpen}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#18364B] hover:bg-[#EAF4FB] cursor-pointer"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {unreadNotificationCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#C8F542] border border-white text-[#18364B] text-[10px] font-extrabold inline-flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            ) : null}
          </button>

          {notifOpen ? (
            <div
              role="dialog"
              aria-label="Recent notifications"
              className="absolute right-0 mt-2 w-[310px] sm:w-[340px] rounded-2xl bg-white border border-[#DCEAF4] shadow-[0_16px_36px_-8px_rgba(24,54,75,0.18)] overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-[#E6F1F8] flex items-center justify-between gap-2 bg-[#F8FCFF]">
                <p className="text-sm font-bold text-[#18364B]">
                  Notifications {unreadNotificationCount > 0 ? `(${unreadNotificationCount})` : ''}
                </p>
                {unreadNotificationCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void onMarkAllRead()}
                    className="text-xs font-semibold text-[#1570EF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Mark all read</span>
                  </button>
                ) : null}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#EFF6FA]">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-[#5A7486]">
                    No notifications yet. Load matches and trip updates will appear here.
                  </div>
                ) : (
                  notifications.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(item.targetPath ?? '/transporter/notifications');
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-[#F4FAFE] transition-colors cursor-pointer space-y-0.5',
                        !item.read && 'bg-[#F6FCEF]',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#18364B] truncate">{item.title}</p>
                        {!item.read ? (
                          <span className="w-2 h-2 rounded-full bg-[#77B900] shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-[11.5px] text-[#4A6578] line-clamp-2">{item.message}</p>
                    </button>
                  ))
                )}
              </div>

              <Link
                to="/transporter/notifications"
                onClick={() => setNotifOpen(false)}
                className="block text-center py-2.5 text-xs font-bold text-[#1570EF] bg-[#F8FCFF] border-t border-[#E6F1F8] hover:bg-[#EDF6FC]"
              >
                View All Notifications
              </Link>
            </div>
          ) : null}
        </div>

        {/* Desktop Profile Trigger & Dropdown */}
        <div className="relative hidden md:block" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen(false);
              setProfileOpen((prev) => !prev);
            }}
            aria-expanded={profileOpen}
            aria-label="Account menu"
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-[#F1F8FD] transition-colors cursor-pointer"
          >
            <span className="w-9 h-9 rounded-full bg-[#DCEEFB] text-[#18364B] font-bold text-[13px] inline-flex items-center justify-center shrink-0">
              {initials}
            </span>
            <span className="text-left leading-tight max-w-[160px]">
              <span className="block text-[13px] font-bold text-[#18364B] truncate">
                {profile.displayName}
              </span>
              <span className="block text-[11px] font-medium text-[#5A7486]">Transporter</span>
            </span>
            <ChevronDown className="w-4 h-4 text-[#4A6578]" aria-hidden="true" />
          </button>

          {profileOpen ? (
            <div
              role="menu"
              aria-label="Transporter account options"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#DCEAF4] shadow-[0_16px_36px_-8px_rgba(24,54,75,0.18)] py-1.5 z-50"
            >
              <Link
                to="/transporter/profile"
                onClick={() => setProfileOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#18364B] hover:bg-[#F3F9FE]"
              >
                <User className="w-4 h-4 text-[#4A6578]" aria-hidden="true" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/transporter/profile?tab=settings"
                onClick={() => setProfileOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#18364B] hover:bg-[#F3F9FE]"
              >
                <Settings className="w-4 h-4 text-[#4A6578]" aria-hidden="true" />
                <span>Account Settings</span>
              </Link>
              <Link
                to="/transporter/documents"
                onClick={() => setProfileOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#18364B] hover:bg-[#F3F9FE]"
              >
                <FileText className="w-4 h-4 text-[#4A6578]" aria-hidden="true" />
                <span>Document Centre</span>
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenLanguageSwitcher();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#18364B] hover:bg-[#F3F9FE] cursor-pointer text-left"
              >
                <Globe className="w-4 h-4 text-[#4A6578]" aria-hidden="true" />
                <span>Language</span>
              </button>
              <hr className="my-1 border-[#E8F2F8]" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  void onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-bold text-[#B42318] hover:bg-[#FEF3F2] cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
