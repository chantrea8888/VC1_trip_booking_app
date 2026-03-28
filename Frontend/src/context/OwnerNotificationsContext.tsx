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

<<<<<<< HEAD
const asString = (value: any): string => {
  if (value == null) return '';
  return String(value);
};

const toIsoIfPossible = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === 'string' && value.trim()) return value;
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
};

const formatMoney = (value: any): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
};

const buildBookingSummary = (booking: any): { title: string; message: string; bookingId: string | null } => {
  const bookingId = asString(booking?.id ?? booking?.bookingId ?? booking?.booking_id).trim() || null;
  const title = `New booking${bookingId ? `: ${bookingId}` : ''}`;

  const guest = asString(booking?.guest ?? booking?.customerName ?? booking?.guest_name ?? '').trim();
  const service = asString(booking?.service ?? booking?.hotelName ?? booking?.service_name ?? '').trim();
  const route = asString(booking?.route ?? booking?.location ?? booking?.destination ?? '').trim();
  const amount = booking?.amount ?? booking?.totalAmount ?? booking?.total_amount;

  const parts: string[] = [];
  if (guest) parts.push(guest);
  if (service) {
    const serviceLabel = route ? `${service} (${route})` : service;
    parts.push(`booked ${serviceLabel}`);
  }
  if (amount != null) parts.push(formatMoney(amount));

  const message = parts.join(' • ') || 'A new booking was created.';
  return { title, message, bookingId };
};

const normalizeOwnerNotification = (raw: any): OwnerNotification | null => {
  if (!raw) return null;

  const data = raw?.data ?? raw?.booking ?? raw?.payload ?? null;
  const bookingIdRaw =
    raw?.bookingId ?? raw?.booking_id ?? raw?.bookingID ?? data?.bookingId ?? data?.booking_id ?? data?.id ?? null;

  // When the backend uses a numeric `notifications.booking_id` column, `bookingId` can be an integer token,
  // while the snapshot payload still contains the original booking code ("BK-..."). Prefer that code so we
  // can dedupe and link notifications consistently.
  const bookingCodeFromData = asString(data?.id ?? data?.bookingId ?? data?.booking_id ?? '').trim();
  const rawBookingIdStr = asString(bookingIdRaw).trim();

  let bookingId: string | null = rawBookingIdStr || null;
  if (bookingCodeFromData && /^BK-/i.test(bookingCodeFromData)) {
    if (!bookingId || /^\d+$/.test(bookingId)) {
      bookingId = bookingCodeFromData;
    }
  }

  const readAt = toIsoIfPossible(raw?.readAt ?? raw?.read_at ?? raw?.readAtDate ?? null);
  const createdAt = toIsoIfPossible(raw?.createdAt ?? raw?.created_at ?? raw?.timestamp ?? null);

  let title = asString(raw?.title ?? data?.title ?? '').trim();
  let message = asString(raw?.message ?? raw?.body ?? raw?.description ?? data?.message ?? data?.description ?? '').trim();

  if ((!title || !message) && data) {
    const summary = buildBookingSummary(data);
    if (!title) title = summary.title;
    if (!message) message = summary.message;
  }

  if (!title) title = bookingId ? `New booking: ${bookingId}` : 'New booking';

  return {
    id: raw?.id ?? bookingId ?? Math.random().toString(16).slice(2),
    title,
    message: message || null,
    bookingId,
    data,
    readAt,
    createdAt,
  };
};

const buildDerivedNotificationsFromBookings = (bookings: any[], limit: number): OwnerNotification[] => {
  const list = Array.isArray(bookings) ? bookings : [];
  const normalized = list
    .map((b) => {
      if (!b) return null;
      const summary = buildBookingSummary(b);
      const createdAt = toIsoIfPossible(b?.createdAt ?? b?.created_at ?? b?.date ?? b?.dateStart ?? null);
      const bookingId = summary.bookingId;
      const stableId = bookingId ?? asString(b?.id ?? '').trim();
      const derivedId = stableId || Math.random().toString(16).slice(2);
      return {
        id: `derived:${derivedId}`,
        title: summary.title,
        message: summary.message,
        bookingId,
        data: b,
        readAt: null,
        createdAt,
      } satisfies OwnerNotification;
    })
    .filter(Boolean) as OwnerNotification[];

  return normalized.slice(0, Math.max(1, limit));
};

const dedupeNotifications = (list: OwnerNotification[]): OwnerNotification[] => {
  if (!Array.isArray(list) || list.length === 0) return [];

  const seen = new Set<string>();
  const out: OwnerNotification[] = [];

  for (const n of list) {
    const key = n.bookingId ? `booking:${String(n.bookingId)}` : `id:${String(n.id)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }

  return out;
};

=======
>>>>>>> social-account
export const OwnerNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const enabled = isAuthenticated && user?.role === 'owner';

  const [notifications, setNotifications] = React.useState<OwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [activeNotification, setActiveNotification] = React.useState<OwnerNotification | null>(null);

<<<<<<< HEAD
  const readCacheRef = React.useRef<Record<string, string>>({});
  const readCacheKey = React.useMemo(() => `owner_notification_read_cache:${String(user?.id ?? 'owner')}`, [user?.id]);

  const loadReadCache = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(readCacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        readCacheRef.current = parsed;
      }
    } catch {
      // ignore
    }
  }, [readCacheKey]);

  const saveReadCache = React.useCallback(() => {
    try {
      localStorage.setItem(readCacheKey, JSON.stringify(readCacheRef.current));
    } catch {
      // ignore
    }
  }, [readCacheKey]);

  React.useEffect(() => {
    if (!enabled) {
      readCacheRef.current = {};
      return;
    }
    loadReadCache();
  }, [enabled, loadReadCache]);

  const applyReadCache = React.useCallback((list: OwnerNotification[]) => {
    if (!Array.isArray(list) || list.length === 0) return list;
    const cache = readCacheRef.current;
    if (!cache || Object.keys(cache).length === 0) return list;

    return list.map((n) => {
      if (n.readAt) return n;
      const cached = cache[String(n.id)];
      if (!cached) return n;
      return { ...n, readAt: cached };
    });
  }, []);

=======
>>>>>>> social-account
  const refresh = React.useCallback(
    async ({ silent = false }: RefreshOptions = {}) => {
      if (!enabled) return;

      try {
<<<<<<< HEAD
        if (!silent) {
          setLoading(true);
          // Avoid showing a stale badge count while we refresh.
          setUnreadCount(0);
        }

        // Notifications API is best-effort. If it fails (common when the backend `notifications` schema differs),
        // still build a badge + feed from bookings so owners always see a live counter.
        let response: any = null;
        try {
          response = await bookingService.getOwnerNotifications({ limit: 25 });
        } catch (error) {
          console.error('Failed to fetch owner notifications API:', error);
          response = null;
        }

        const raw = Array.isArray(response?.data) ? response.data : [];
        const next = raw.map(normalizeOwnerNotification).filter(Boolean) as OwnerNotification[];

        const nextUnreadFromApi = Number(response?.unread_count ?? response?.unreadCount);
        const nextUnread = Number.isFinite(nextUnreadFromApi)
          ? nextUnreadFromApi
          : next.filter((n: any) => !n?.readAt).length;

        // Always best-effort merge the latest bookings into the feed. This makes the dashboard resilient
        // even when the backend notification tables are empty or partially failing.
        try {
          const bookingsResp = await bookingService.getBookings({ date_range: 'last3' });
          const bookings = Array.isArray(bookingsResp?.data) ? bookingsResp.data : [];
          const derived = applyReadCache(buildDerivedNotificationsFromBookings(bookings, 25));

          const seenBookingIds = new Set(
            next
              .map((n) => String(n.bookingId ?? n?.data?.id ?? '').trim())
              .filter(Boolean),
          );
          const merged = [
            ...next,
            ...derived.filter((d) => {
              const id = String(d.bookingId ?? d?.data?.id ?? '').trim();
              return id && !seenBookingIds.has(id);
            }),
          ];

          merged.sort((a, b) => {
            const at = toIsoIfPossible(a.createdAt) ?? '';
            const bt = toIsoIfPossible(b.createdAt) ?? '';
            if (at && bt) return bt.localeCompare(at);
            return String(b.id).localeCompare(String(a.id));
          });

          const finalList = applyReadCache(dedupeNotifications(merged).slice(0, 25));
          setNotifications(finalList);
          setUnreadCount(finalList.filter((n) => !n.readAt).length || Math.max(0, nextUnread));
          return;
        } catch (mergeError) {
          console.error('Failed to merge bookings into notifications feed:', mergeError);
        }

        // Fallback: derive a feed from bookings (even when notifications API is down).
        try {
          const bookingsResp = await bookingService.getBookings({});
          const bookings = Array.isArray(bookingsResp?.data) ? bookingsResp.data : [];
          const derived = applyReadCache(dedupeNotifications(buildDerivedNotificationsFromBookings(bookings, 25)));
          setNotifications(derived);
          setUnreadCount(derived.filter((n) => !n.readAt).length);
          return;
        } catch (fallbackError) {
          console.error('Failed to build fallback notifications:', fallbackError);
        }

        // Last resort: show whatever we got from the notifications API (may be empty).
        const cachedNext = applyReadCache(dedupeNotifications(next));
        setNotifications(cachedNext);
        setUnreadCount(cachedNext.filter((n) => !n.readAt).length || Math.max(0, nextUnread));
=======
        if (!silent) setLoading(true);
        const response = await bookingService.getOwnerNotifications({ limit: 25 });
        const next = Array.isArray(response?.data) ? response.data : [];
        const nextUnread = Number(
          response?.unread_count ?? response?.unreadCount ?? next.filter((n: any) => !n?.readAt).length,
        );

        setNotifications(next);
        setUnreadCount(Number.isFinite(nextUnread) ? nextUnread : 0);
>>>>>>> social-account
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
<<<<<<< HEAD

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
=======
    const id = window.setInterval(() => refresh({ silent: true }), 30000);
    return () => window.clearInterval(id);
>>>>>>> social-account
  }, [enabled, refresh]);

  const markRead = React.useCallback(
    async (notificationId: number | string) => {
      if (!enabled || !notificationId) return;

<<<<<<< HEAD
      const idStr = String(notificationId);
      // Derived notifications are local-only (built from bookings), so they can't be marked read via API.
      const nowIso = new Date().toISOString();

      // Optimistic local update + persist read state (so refresh doesn't bring it back as unread).
      readCacheRef.current[idStr] = readCacheRef.current[idStr] ?? nowIso;
      saveReadCache();

      setNotifications((prev) =>
        prev.map((n) => (String(n.id) === idStr ? { ...n, readAt: n.readAt ?? nowIso } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      if (!idStr.startsWith('derived:')) {
        try {
          await bookingService.markOwnerNotificationRead(notificationId);
        } catch (error) {
          console.error('Failed to mark notification read:', error);
        }
      }
    },
    [enabled, saveReadCache],
=======
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
>>>>>>> social-account
  );

  const markAllRead = React.useCallback(async () => {
    if (!enabled) return;

    try {
      await bookingService.markAllOwnerNotificationsRead();
    } catch (error) {
<<<<<<< HEAD
      // Still mark derived/local items as read even if the API call fails.
      console.error('Failed to mark all notifications read:', error);
    }

    const nowIso = new Date().toISOString();
    setNotifications((prev) => {
      prev.forEach((n) => {
        const id = String(n.id);
        readCacheRef.current[id] = readCacheRef.current[id] ?? nowIso;
      });
      saveReadCache();
      return prev.map((n) => ({ ...n, readAt: n.readAt ?? nowIso }));
    });
    setUnreadCount(0);
  }, [enabled, saveReadCache]);
=======
      console.error('Failed to mark all notifications read:', error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
  }, [enabled]);
>>>>>>> social-account

  const value = React.useMemo<OwnerNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      activeNotification,
      refresh,
      markRead,
      markAllRead,
<<<<<<< HEAD
      openNotification: (notification: OwnerNotification) => {
        setActiveNotification(notification);

        const bookingId = String(notification?.bookingId ?? notification?.data?.id ?? '').trim();
        if (!bookingId || notification?.data) return;

        bookingService
          .getBookings({ booking_id: bookingId })
          .then((res: any) => {
            const booking = Array.isArray(res?.data) ? res.data[0] : null;
            if (!booking) return;

            setNotifications((prev) =>
              prev.map((n) => (String(n.id) === String(notification.id) ? { ...n, data: booking } : n)),
            );
            setActiveNotification((prev) =>
              prev && String(prev.id) === String(notification.id) ? { ...prev, data: booking } : prev,
            );
          })
          .catch((err: any) => {
            console.error('Failed to load booking details for notification:', err);
          });
      },
=======
      openNotification: (notification: OwnerNotification) => setActiveNotification(notification),
>>>>>>> social-account
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
