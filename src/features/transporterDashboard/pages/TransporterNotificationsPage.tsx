import { Bell, CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTransporterNotifications,
  markNotificationsRead,
} from '../../../services/transporter/transporterDashboardService';
import { cn } from '../../../utils/cn';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { TransporterNotification } from '../transporterDashboardTypes';

export function TransporterNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<TransporterNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetchTransporterNotifications();
    if (res.ok) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id?: string) => {
    const res = await markNotificationsRead(id);
    if (res.ok) {
      setUnreadCount(res.data.unreadCount);
      setNotifications((prev) =>
        prev.map((n) => (!id || id === n.id ? { ...n, read: true } : n)),
      );
    }
  };

  return (
    <TransporterDashboardShell
      pageTitle="Notifications"
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    >
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#18364B]">
              Notifications {unreadCount > 0 ? `(${unreadCount} Unread)` : ''}
            </h2>
            <p className="text-xs sm:text-sm text-[#4A6578]">
              Updates on compatible loads, fleet alerts, and freight offers.
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void handleMarkRead()}
              className="h-10 px-4 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer self-start"
            >
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
              <span>Mark All Read</span>
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-[#5A7486] mx-auto" aria-hidden="true" />
            <p className="text-base font-bold text-[#18364B]">You&apos;re all caught up.</p>
            <p className="text-sm text-[#4A6578]">No notifications have been recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'rounded-[18px] border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                  n.read ? 'bg-white border-[#DCEAF4]' : 'bg-[#F5FCEF] border-[#C8EC90]',
                )}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {!n.read ? <span className="w-2 h-2 rounded-full bg-[#64A800]" /> : null}
                    <h3 className="text-sm font-bold text-[#18364B]">{n.title}</h3>
                  </div>
                  <p className="text-xs text-[#4A6578]">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.read ? (
                    <button
                      type="button"
                      onClick={() => void handleMarkRead(n.id)}
                      className="h-8 px-3 rounded-full border border-[#CBE0EE] bg-white text-xs font-bold text-[#18364B] cursor-pointer"
                    >
                      Mark Read
                    </button>
                  ) : null}
                  {n.targetPath ? (
                    <button
                      type="button"
                      onClick={() => navigate(n.targetPath!)}
                      className="h-8 px-3 rounded-full bg-[#EAF5FD] text-[#1570EF] text-xs font-bold cursor-pointer"
                    >
                      Open
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
