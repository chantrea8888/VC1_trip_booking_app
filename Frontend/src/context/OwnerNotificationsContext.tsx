import React from 'react';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '@/context/AuthContext';

export type OwnerNotification = {
  id: number | string;
  title: string;
  message?: string | null;
  bookingId?: string | null;
  data?: any;
  readAt?: string | null;
  createdAt?: string | null;
};

type RefreshOptions = { silent?: boolean };

type OwnerNotificationsContextValue = {
  notifications: OwnerNotification[];
  unreadCount: number;
  loading: boolean;
  activeNotification: OwnerNotification | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  markRead: (notificationId: number | string) => Promise<void>;
  markAllRead: () => Promise<void>;
  openNotification: (notification: OwnerNotification) => void;
  closeNotification: () => void;
};

const OwnerNotificationsContext = React.createContext<OwnerNotificationsContextValue | undefined>(undefined);

export const OwnerNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const enabled = isAuthenticated && user?.role === 'owner';

  const [notifications, setNotifications] = React.useState<OwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [activeNotification, setActiveNotification] = React.useState<OwnerNotification | null>(null);

  const refresh = React.useCallback(
    async ({ silent = false }: RefreshOptions = {}) => {
      if (!enabled) return;

      try {
        if (!silent) setLoading(true);
        const response = await bookingService.getOwnerNotifications({ limit: 25 });
        const next = Array.isArray(response?.data) ? response.data : [];
        const nextUnread = Number(
          response?.unread_count ?? response?.unreadCount ?? next.filter((n: any) => !n?.readAt).length,
        );

        setNotifications(next);
        setUnreadCount(Number.isFinite(nextUnread) ? nextUnread : 0);
      } catch (error) {
        // best-effort: don't break the UI if notifications fail
        console.error('Failed to fetch owner notifications:', error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [enabled],
  );

  React.useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    refresh();

    const pollId = window.setInterval(() => refresh({ silent: true }), 15000);

    const handleFocus = () => refresh({ silent: true });
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh({ silent: true });
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, refresh]);

  const markRead = React.useCallback(
    async (notificationId: number | string) => {
      if (!enabled || !notificationId) return;

      try {
        await bookingService.markOwnerNotificationRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification read:', error);
        return;
      }

      setNotifications((prev) =>
        prev.map((n) =>
          String(n.id) === String(notificationId) ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [enabled],
  );

  const markAllRead = React.useCallback(async () => {
    if (!enabled) return;

    try {
      await bookingService.markAllOwnerNotificationsRead();
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
  }, [enabled]);

  const value = React.useMemo<OwnerNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      activeNotification,
      refresh,
      markRead,
      markAllRead,
      openNotification: (notification: OwnerNotification) => setActiveNotification(notification),
      closeNotification: () => setActiveNotification(null),
    }),
    [activeNotification, loading, markAllRead, markRead, notifications, refresh, unreadCount],
  );

  return <OwnerNotificationsContext.Provider value={value}>{children}</OwnerNotificationsContext.Provider>;
};

export const useOwnerNotifications = () => {
  const ctx = React.useContext(OwnerNotificationsContext);
  if (!ctx) {
    throw new Error('useOwnerNotifications must be used within an OwnerNotificationsProvider');
  }
  return ctx;
};
