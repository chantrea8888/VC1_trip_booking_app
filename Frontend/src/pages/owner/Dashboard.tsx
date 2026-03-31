import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Ticket, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CalendarCheck,
  MessageSquare,
  CheckCircle2,
  Rocket,
  Download,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/utils/utils';
import type { AdminNotification } from '@/components/common/NotificationDropdown';
import { bookingService } from '@/services/bookingService';
import { apiRequest } from '@/services/api';

const StatCard = ({ title, value, change, changeType, icon: Icon, subtitle, note }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
        <Icon size={24} />
      </div>
      {change && (
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1",
          changeType === 'positive' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
        )}>
          {changeType === 'positive' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </span>
      )}
      {!change && subtitle && (
        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{subtitle}</span>
      )}
    </div>
    <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-1">{title}</p>
    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    {note && (
      <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {note}
      </p>
    )}
    {title === 'Average Rating' && subtitle && (
      <div className="flex items-center gap-3 mt-3">
        <div className="flex text-amber-400">
          {[...Array(4)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          <Star size={14} />
        </div>
        <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
      </div>
    )}
  </div>
);

const toNumber = (value: any) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDate = (value: any) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(value) ? value : 0);

const formatPercent = (current: number, previous: number) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return '0.0%';
  if (previous === 0) return current > 0 ? '100.0%' : '0.0%';
  const delta = ((current - previous) / previous) * 100;
  return `${Math.abs(delta).toFixed(1)}%`;
};

const getDeltaType = (current: number, previous: number) => (current >= previous ? 'positive' : 'negative');

const buildRevenueSeries = (bookings: any[], range: 'weekly' | 'monthly') => {
  const now = new Date();
  const buckets =
    range === 'weekly'
      ? Array.from({ length: 7 }, (_, index) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (6 - index));
          return {
            key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            value: 0,
          };
        })
      : Array.from({ length: 12 }, (_, index) => {
          const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
          return {
            key: `${date.getFullYear()}-${date.getMonth()}`,
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            value: 0,
          };
        });

  const source = Array.isArray(bookings) ? bookings : [];
  source.forEach((booking: any) => {
    const created = parseDate(booking?.createdAt ?? booking?.created_at ?? booking?.date ?? booking?.dateStart ?? booking?.date_start);
    if (!created) return;

    const amount = toNumber(booking?.totalAmount ?? booking?.total_amount ?? booking?.amount);
    if (amount <= 0) return;

    if (range === 'weekly') {
      const key = `${created.getFullYear()}-${created.getMonth()}-${created.getDate()}`;
      const bucket = buckets.find((entry) => entry.key === key);
      if (bucket) bucket.value += amount;
      return;
    }

    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.find((entry) => entry.key === key);
    if (bucket) bucket.value += amount;
  });

  return buckets.map(({ name, value }) => ({ name, value: Number(value.toFixed(2)) }));
};

const buildAverageRating = (items: any[]) => {
  const ratings = (Array.isArray(items) ? items : [])
    .map((item) => toNumber(item?.rating ?? item?.stars_rating))
    .filter((rating) => rating > 0);
  if (ratings.length === 0) return { rating: 0, count: 0 };
  const sum = ratings.reduce((acc, value) => acc + value, 0);
  return { rating: sum / ratings.length, count: ratings.length };
};

interface OwnerDashboardProps {
  notifications?: AdminNotification[];
  onOpenBooking?: (bookingId: string) => void;
  onOpenMessageThread?: (notification: AdminNotification) => void;
  onMarkNotificationRead?: (notificationId: string) => void;
  onViewAllActivities?: () => void;
}

const Dashboard: React.FC<OwnerDashboardProps> = ({
  notifications,
  onOpenBooking,
  onOpenMessageThread,
  onMarkNotificationRead,
  onViewAllActivities,
}) => {
  const getActivityIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'booking':
        return CalendarCheck;
      case 'alert':
        return Star;
      case 'message':
        return MessageSquare;
      case 'system':
      default:
        return CheckCircle2;
    }
  };

  const notificationActivities = (notifications ?? [])
    .slice(0, 4)
    .map((n) => ({
      icon: getActivityIcon(n.type),
      title: n.title,
      desc: n.description,
      time: n.time,
      bookingId: n.bookingId ?? null,
      notificationId: n.id,
      type: n.type,
      conversationId: n.data?.conversationId ?? n.conversationId ?? null,
      conversationEmail: n.data?.conversationEmail ?? n.conversationEmail ?? null,
      conversationName: n.data?.conversationName ?? n.conversationName ?? null,
      conversationAvatar: n.data?.conversationAvatar ?? n.conversationAvatar ?? null,
      data: n.data ?? null,
      read: n.read,
    }));

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  const [overviewLoading, setOverviewLoading] = React.useState(true);
  const [overviewError, setOverviewError] = React.useState('');
  const [overviewStats, setOverviewStats] = React.useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeGuests: 0,
    pendingPayments: '$0.00',
    averageRating: 0,
    ratedCount: 0,
  });
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [chartRange, setChartRange] = React.useState<'weekly' | 'monthly'>('weekly');

  const [selectedActivity, setSelectedActivity] = React.useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      setOverviewLoading(true);
      setOverviewError('');

      try {
        const [bookingResponse, statsResponse, destinationsResponse, hotelsResponse] = await Promise.all([
          bookingService.getBookings().catch(() => ({ data: [] })),
          bookingService.getBookingStats().catch(() => null),
          apiRequest('/destinations').catch(() => ({ data: [] })),
          apiRequest('/hotels').catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        const bookingRows = Array.isArray(bookingResponse?.data) ? bookingResponse.data : [];
        const destinationRows = Array.isArray((destinationsResponse as any)?.data)
          ? (destinationsResponse as any).data
          : Array.isArray(destinationsResponse)
            ? destinationsResponse
            : [];
        const hotelRows = Array.isArray((hotelsResponse as any)?.data)
          ? (hotelsResponse as any).data
          : Array.isArray(hotelsResponse)
            ? hotelsResponse
            : [];

        const paidBookings = bookingRows.filter((booking: any) => String(booking?.status ?? '').toLowerCase() === 'paid');
        const totalRevenue = paidBookings.reduce((sum: number, booking: any) => sum + toNumber(booking?.totalAmount ?? booking?.total_amount ?? booking?.amount), 0);

        const now = new Date();
        const currentWindowStart = new Date(now);
        currentWindowStart.setDate(now.getDate() - 30);
        const previousWindowStart = new Date(now);
        previousWindowStart.setDate(now.getDate() - 60);

        const revenueInWindow = (start: Date, end: Date) =>
          bookingRows
            .filter((booking: any) => {
              const created = parseDate(booking?.createdAt ?? booking?.created_at);
              return created && created >= start && created < end && String(booking?.status ?? '').toLowerCase() === 'paid';
            })
            .reduce((sum: number, booking: any) => sum + toNumber(booking?.totalAmount ?? booking?.total_amount ?? booking?.amount), 0);

        const bookingsInWindow = (start: Date, end: Date) =>
          bookingRows.filter((booking: any) => {
            const created = parseDate(booking?.createdAt ?? booking?.created_at);
            return created && created >= start && created < end;
          }).length;

        const currentRevenue = revenueInWindow(currentWindowStart, now);
        const previousRevenue = revenueInWindow(previousWindowStart, currentWindowStart);
        const currentBookings = bookingsInWindow(currentWindowStart, now);
        const previousBookings = bookingsInWindow(previousWindowStart, currentWindowStart);

        const ratingData = buildAverageRating([...destinationRows, ...hotelRows]);
        const backendStats = statsResponse ?? {};

        setBookings(bookingRows);
        setOverviewStats({
          totalRevenue,
          totalBookings: toNumber(backendStats?.total_bookings ?? bookingRows.length),
          activeGuests: toNumber(backendStats?.active_guests ?? 0),
          pendingPayments: String(backendStats?.pending_payments ?? '$0.00'),
          averageRating: ratingData.rating,
          ratedCount: ratingData.count,
        });

        setOverviewError('');

        // keep derived values available to the card labels via local calculation
        // (the card values themselves are computed below from the fetched data)
        (loadOverview as any).currentRevenue = currentRevenue;
        (loadOverview as any).previousRevenue = previousRevenue;
        (loadOverview as any).currentBookings = currentBookings;
        (loadOverview as any).previousBookings = previousBookings;
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load owner overview data', error);
          setOverviewError('Failed to load real overview data.');
          setBookings([]);
          setOverviewStats({
            totalRevenue: 0,
            totalBookings: 0,
            activeGuests: 0,
            pendingPayments: '$0.00',
            averageRating: 0,
            ratedCount: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  const revenueSeries = React.useMemo(() => buildRevenueSeries(bookings, chartRange), [bookings, chartRange]);

  const revenueChange = React.useMemo(() => {
    const now = new Date();
    const currentWindowStart = new Date(now);
    currentWindowStart.setDate(now.getDate() - 30);
    const previousWindowStart = new Date(now);
    previousWindowStart.setDate(now.getDate() - 60);

    const revenueInWindow = (start: Date, end: Date) =>
      bookings
        .filter((booking: any) => {
          const created = parseDate(booking?.createdAt ?? booking?.created_at);
          return created && created >= start && created < end && String(booking?.status ?? '').toLowerCase() === 'paid';
        })
        .reduce((sum: number, booking: any) => sum + toNumber(booking?.totalAmount ?? booking?.total_amount ?? booking?.amount), 0);

    const currentRevenue = revenueInWindow(currentWindowStart, now);
    const previousRevenue = revenueInWindow(previousWindowStart, currentWindowStart);
    return {
      value: formatPercent(currentRevenue, previousRevenue),
      type: getDeltaType(currentRevenue, previousRevenue),
      currentRevenue,
    };
  }, [bookings]);

  const bookingsChange = React.useMemo(() => {
    const now = new Date();
    const currentWindowStart = new Date(now);
    currentWindowStart.setDate(now.getDate() - 30);
    const previousWindowStart = new Date(now);
    previousWindowStart.setDate(now.getDate() - 60);

    const bookingsInWindow = (start: Date, end: Date) =>
      bookings.filter((booking: any) => {
        const created = parseDate(booking?.createdAt ?? booking?.created_at);
        return created && created >= start && created < end;
      }).length;

    const currentBookings = bookingsInWindow(currentWindowStart, now);
    const previousBookings = bookingsInWindow(previousWindowStart, currentWindowStart);
    return {
      value: formatPercent(currentBookings, previousBookings),
      type: getDeltaType(currentBookings, previousBookings),
    };
  }, [bookings]);

  const activities = notificationActivities;

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedActivity(null);
  };

  const getBookingImage = (booking: any) => {
    return (
      booking?.image ||
      booking?.serviceImage ||
      booking?.hotelImage ||
      booking?.rentalImage ||
      booking?.transportImage ||
      booking?.data?.image ||
      null
    );
  };

  const getStatusColor = (status: string) => {
    const s = String(status || 'pending').toLowerCase();
    if (s === 'paid') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    if (s === 'canceled' || s === 'cancelled') return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
  };

  const openActivityDetails = (activity: any) => {
    if (activity?.type === 'message' && activity?.conversationId && onOpenMessageThread) {
      onOpenMessageThread({
        id: String(activity.notificationId ?? activity.conversationId),
        title: String(activity.title ?? 'New message'),
        description: String(activity.desc ?? ''),
        time: String(activity.time ?? ''),
        type: 'message',
        read: Boolean(activity.read),
        data: {
          conversationId: activity.conversationId,
          conversationEmail: activity.conversationEmail,
          conversationName: activity.conversationName,
          conversationAvatar: activity.conversationAvatar,
        },
      });
      return;
    }

    if (!activity?.bookingId) return;
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
    if (activity?.notificationId) onMarkNotificationRead?.(String(activity.notificationId));
  };

  const updateBookingStatus = async (nextStatus: 'pending' | 'paid' | 'canceled') => {
    const bookingId = selectedActivity?.bookingId || selectedActivity?.data?.id;
    if (!bookingId || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await bookingService.updateBookingStatus(String(bookingId), nextStatus);
      setSelectedActivity((prev: any) => ({
        ...prev,
        data: { ...(prev?.data ?? {}), status: nextStatus },
      }));
    } catch (e) {
      console.error('Failed to update booking status', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const parseBookingDate = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const parseDateOnlyLocal = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const text = String(value).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const date = new Date(y, mo - 1, d);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateTime = (value: any) => {
    const d = parseBookingDate(value);
    if (!d) return value ? String(value) : '-';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (value: any) => {
    const d = parseDateOnlyLocal(value);
    if (!d) return value ? String(value) : '-';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatStay = (booking: any) => {
    const start = booking?.dateStart ?? booking?.date_start;
    const end = booking?.dateEnd ?? booking?.date_end;
    if (start && end) return `${formatDateOnly(start)} → ${formatDateOnly(end)}`;
    if (start) return formatDateOnly(start);
    return '-';
  };

  const downloadReceiptPdf = async () => {
    if (!receiptRef.current || !selectedActivity?.data) return;

    try {
      const loadLib = async (name: string) => {
        const importer = Function('n', 'return import(n)') as (n: string) => Promise<any>;
        return importer(name);
      };

      const [html2canvasMod, jsPDFMod] = await Promise.all([loadLib('html2canvas'), loadLib('jspdf')]);
      const html2canvas = html2canvasMod?.default;
      const jsPDF = jsPDFMod?.default;
      if (!html2canvas || !jsPDF) throw new Error('Missing PDF dependencies');

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-${String(selectedActivity.data.id ?? 'booking')}.pdf`);
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      window.print();
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-8">
      {overviewLoading && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-200">
          Loading live overview data...
        </div>
      )}
      {overviewError && !overviewLoading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200">
          {overviewError}
        </div>
      )}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={overviewLoading ? '—' : formatCurrency(overviewStats.totalRevenue)} 
          change={overviewLoading ? null : revenueChange.value} 
          changeType={revenueChange.type} 
          icon={CreditCard} 
          note={overviewLoading ? 'Loading...' : 'Based on paid bookings'}
        />
        <StatCard 
          title="Total Bookings" 
          value={overviewLoading ? '—' : overviewStats.totalBookings.toLocaleString()} 
          change={overviewLoading ? null : bookingsChange.value} 
          changeType={bookingsChange.type} 
          icon={Ticket} 
          note={overviewLoading ? 'Loading...' : `${overviewStats.activeGuests.toLocaleString()} active guests · ${overviewStats.pendingPayments} pending`}
        />
        <StatCard 
          title="Average Rating" 
          value={overviewLoading ? '—' : (overviewStats.averageRating > 0 ? overviewStats.averageRating.toFixed(1) : '0.0')} 
          subtitle={overviewLoading ? 'Loading...' : `Based on ${overviewStats.ratedCount} rated listings`} 
          icon={Star} 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="font-bold text-lg">Financial Performance</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Real-time revenue stream analysis</p>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setChartRange('weekly')}
                className={cn(
                  'px-4 py-1.5 text-[11px] font-bold rounded-md shadow-sm transition-colors',
                  chartRange === 'weekly'
                    ? 'bg-white dark:bg-slate-700 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                WEEKLY
              </button>
              <button
                type="button"
                onClick={() => setChartRange('monthly')}
                className={cn(
                  'px-4 py-1.5 text-[11px] font-bold rounded-md shadow-sm transition-colors',
                  chartRange === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                MONTHLY
              </button>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div id="recent-activities" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h4 className="font-bold">Recent Activities</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-1 rounded-full uppercase tracking-wider">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={onViewAllActivities}
                className="text-xs text-blue-600 font-bold hover:bg-blue-600/5 px-2 py-1 rounded transition-colors uppercase tracking-wider"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {activities.length > 0 ? activities.map((activity, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (activity?.type === 'message') {
                      openActivityDetails(activity);
                      return;
                    }
                    if (activity?.data) {
                      openActivityDetails(activity);
                      return;
                    }
                    if (activity?.bookingId && onOpenBooking) onOpenBooking(String(activity.bookingId));
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 group rounded-xl px-2.5 py-2.5 -mx-2 transition-colors text-left",
                    (activity?.bookingId || activity?.type === 'message') ? "cursor-pointer" : "cursor-default",
                    i !== 3 && "border-b border-slate-50 dark:border-slate-800/50",
                    activity?.read === false && "bg-blue-50/80 dark:bg-blue-900/20",
                    activity?.type === 'message' && "hover:bg-blue-50/60 dark:hover:bg-blue-900/15",
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <activity.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate leading-tight">{activity.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-2 leading-snug">
                      {activity.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">{activity.time}</span>
                    {activity?.read === false && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                </button>
              )) : (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No recent activity yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Details Modal (from customer booking notification) */}
          {isDetailsOpen && selectedActivity?.data && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={closeDetails}
              role="dialog"
              aria-modal="true"
              aria-label="Booking details"
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xl w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedActivity.data.id}</h3>
                    <div className="mt-2">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full", getStatusColor(selectedActivity.data.status))}>
                        {String(selectedActivity.data.status || 'pending').charAt(0).toUpperCase() + String(selectedActivity.data.status || 'pending').slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadReceiptPdf}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                      aria-label="Download receipt"
                    >
                      <Download size={16} />
                      Receipt
                    </button>
                    <button
                      type="button"
                      onClick={closeDetails}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div
                  ref={receiptRef}
                  id="owner-dashboard-receipt"
                  className="mt-5 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                  <div className="bg-blue-600 px-5 py-4 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Official Receipt</p>
                    <h2 className="text-lg font-serif italic mt-1">Komrong Sanctuary</h2>
                    <p className="text-[11px] opacity-90 mt-0.5">Owner Booking Receipt</p>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{selectedActivity.data.id}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatDateTime(selectedActivity.data.createdAt ?? selectedActivity.data.created_at ?? selectedActivity.data.date)}
                        </p>
                        {selectedActivity.data.dateStart && selectedActivity.data.dateEnd && (
                          <p className="mt-0.5 text-xs text-slate-500">Check-in / Check-out: {formatStay(selectedActivity.data)}</p>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const primaryImage =
                        selectedActivity.data?.hotelImage ||
                        selectedActivity.data?.image ||
                        getBookingImage(selectedActivity.data) ||
                        selectedActivity.data?.rentalImage ||
                        selectedActivity.data?.rental?.image ||
                        (Array.isArray(selectedActivity.data?.activities)
                          ? selectedActivity.data.activities.map((a: any) => a?.image).filter(Boolean)[0]
                          : null);

                      if (!primaryImage) return null;

                      return (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                          <img
                            src={primaryImage}
                            alt={selectedActivity.data.service || 'Booking'}
                            className="w-full h-40 object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        </div>
                      );
                    })()}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedActivity.data.guest || '-'}</p>
                          {selectedActivity.data.customerEmail && (
                            <p className="mt-0.5 text-xs text-slate-500">{selectedActivity.data.customerEmail}</p>
                          )}
                          {selectedActivity.data.customerPhone && (
                            <p className="mt-0.5 text-xs text-slate-500">{selectedActivity.data.customerPhone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedActivity.data.service || '-'}</p>
                          {selectedActivity.data.route && <p className="mt-0.5 text-xs text-slate-500">{selectedActivity.data.route}</p>}
                          {selectedActivity.data.roomType && <p className="mt-0.5 text-xs text-slate-500">{selectedActivity.data.roomType}</p>}
                          {selectedActivity.data.vehicleType && <p className="mt-0.5 text-xs text-slate-500">{selectedActivity.data.vehicleType}</p>}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">${Number(selectedActivity.data.amount ?? 0).toFixed(2)}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{selectedActivity.data.pax ?? 0} pax</p>
                          {selectedActivity.data.paymentMethod && (
                            <p className="mt-0.5 text-xs text-slate-500">Method: {selectedActivity.data.paymentMethod}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {String(selectedActivity.data.status || 'pending').charAt(0).toUpperCase() +
                              String(selectedActivity.data.status || 'pending').slice(1)}
                          </p>
                          {selectedActivity.data.reference && (
                            <p className="mt-0.5 text-xs text-slate-500">Ref: {selectedActivity.data.reference}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                      Thank you for using Komrong.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => updateBookingStatus('pending')}
                    disabled={updatingStatus || String(selectedActivity.data.status || '').toLowerCase() === 'pending'}
                    className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBookingStatus('paid')}
                    disabled={updatingStatus || String(selectedActivity.data.status || '').toLowerCase() === 'paid'}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBookingStatus('canceled')}
                    disabled={updatingStatus || String(selectedActivity.data.status || '').toLowerCase() === 'canceled'}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-xl border border-blue-600/10 dark:border-blue-600/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Rocket size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-600 mb-1">Performance Tip</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Update your Mondulkiri routes for the upcoming Water Festival to capture peak holiday traffic.</p>
                <button className="mt-4 text-[10px] font-extrabold text-blue-600 flex items-center gap-1 uppercase tracking-[0.1em] hover:gap-2 transition-all">
                  Update Now <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
