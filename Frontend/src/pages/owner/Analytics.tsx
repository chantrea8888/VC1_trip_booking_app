import React from 'react';
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Sparkles,
  MapPin,
  Route as RouteIcon,
  RefreshCcw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  LineChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { bookingService } from '@/services/bookingService';
import { cn } from '@/utils/utils';

type RangeKey = 'last12' | 'last30';

type BookingRow = Record<string, any>;

type SummaryStats = {
  totalBookings: number;
  activeGuests: number;
  pendingPayments: string;
};

type RangeMetrics = {
  currentRevenue: number;
  previousRevenue: number;
  revenueGrowth: number;
  currentBookings: number;
  previousBookings: number;
  bookingVelocity: number;
  paidShare: number;
  uniqueCustomers: number;
  customerLtv: number;
};

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);

const formatPercent = (value: number) => `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;

const toNumber = (value: any) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDate = (value: any) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const getBookingDate = (booking: BookingRow) =>
  parseDate(
    booking?.createdAt ??
      booking?.created_at ??
      booking?.date ??
      booking?.dateStart ??
      booking?.date_start ??
      booking?.dateEnd ??
      booking?.date_end,
  );

const getBookingValue = (booking: BookingRow) =>
  toNumber(booking?.totalAmount ?? booking?.total_amount ?? booking?.amount);

const getBookingCategory = (booking: BookingRow) => {
  const category = String(booking?.category ?? booking?.serviceType ?? booking?.type ?? 'other').toLowerCase();
  if (category.includes('hotel')) return 'Hotel';
  if (category.includes('transport')) return 'Transport';
  if (category.includes('trip')) return 'Trip';
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const getBookingLabel = (booking: BookingRow) => {
  const route = String(booking?.route ?? '').trim();
  if (route) return route;
  const service = String(booking?.service ?? '').trim();
  if (service) return service;
  return 'Unspecified';
};

const getCustomerKey = (booking: BookingRow) => {
  const userId = booking?.user_id ?? booking?.userId;
  const email = String(booking?.customerEmail ?? booking?.customer_email ?? '').trim().toLowerCase();
  const guest = String(booking?.guest ?? '').trim().toLowerCase();
  return String(userId ?? email ?? guest ?? booking?.id ?? 'unknown');
};

const getStatus = (booking: BookingRow) => String(booking?.status ?? 'pending').toLowerCase();

const monthsBack = (base: Date, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() - (count - 1 - index), 1);
    return date;
  });

const daysBack = (base: Date, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - (count - 1 - index));
    return date;
  });

const buildRevenueSeries = (bookings: BookingRow[], range: RangeKey) => {
  const now = new Date();
  if (range === 'last12') {
    const buckets = monthsBack(now, 12).map((date) => ({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: date.toLocaleDateString('en-US', { month: 'short' }),
      value: 0,
    }));

    bookings.forEach((booking) => {
      if (getStatus(booking) !== 'paid') return;
      const created = getBookingDate(booking);
      if (!created) return;
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      const bucket = buckets.find((item) => item.key === key);
      if (bucket) bucket.value += getBookingValue(booking);
    });

    return buckets.map(({ name, value }) => ({ name, value: Number(value.toFixed(2)) }));
  }

  const buckets = daysBack(now, 30).map((date) => ({
    key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: 0,
  }));

  bookings.forEach((booking) => {
    if (getStatus(booking) !== 'paid') return;
    const created = getBookingDate(booking);
    if (!created) return;
    const key = `${created.getFullYear()}-${created.getMonth()}-${created.getDate()}`;
    const bucket = buckets.find((item) => item.key === key);
    if (bucket) bucket.value += getBookingValue(booking);
  });

  return buckets.map(({ name, value }) => ({ name, value: Number(value.toFixed(2)) }));
};

const buildBookingMix = (bookings: BookingRow[]) => {
  const mix = new Map<string, number>();

  bookings.forEach((booking) => {
    const label = getBookingCategory(booking);
    mix.set(label, (mix.get(label) ?? 0) + 1);
  });

  return Array.from(mix.entries()).map(([name, value]) => ({ name, value }));
};

const buildTopRoutes = (bookings: BookingRow[], range: RangeKey) => {
  const now = new Date();
  const windowDays = range === 'last12' ? 365 : 30;
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - windowDays);
  const previousStart = new Date(now);
  previousStart.setDate(now.getDate() - windowDays * 2);

  const currentMap = new Map<string, { count: number; revenue: number }>();
  const previousMap = new Map<string, { count: number; revenue: number }>();

  bookings.forEach((booking) => {
    const created = getBookingDate(booking);
    if (!created) return;
    const key = getBookingLabel(booking);
    const target = created >= currentStart && created < now ? currentMap : created >= previousStart && created < currentStart ? previousMap : null;
    if (!target) return;

    const item = target.get(key) ?? { count: 0, revenue: 0 };
    item.count += 1;
    item.revenue += getBookingValue(booking);
    target.set(key, item);
  });

  return Array.from(currentMap.entries())
    .map(([name, current]) => {
      const previous = previousMap.get(name) ?? { count: 0, revenue: 0 };
      const growth = previous.count === 0 ? (current.count > 0 ? 100 : 0) : ((current.count - previous.count) / previous.count) * 100;
      return {
        name,
        count: current.count,
        revenue: current.revenue,
        growth,
      };
    })
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    .slice(0, 5);
};

const calculateRangeMetrics = (bookings: BookingRow[], range: RangeKey): RangeMetrics => {
  const now = new Date();
  const spanDays = range === 'last12' ? 365 : 30;
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - spanDays);
  const previousStart = new Date(now);
  previousStart.setDate(now.getDate() - spanDays * 2);

  const currentBookings = bookings.filter((booking) => {
    const created = getBookingDate(booking);
    return created && created >= currentStart && created < now;
  });
  const previousBookings = bookings.filter((booking) => {
    const created = getBookingDate(booking);
    return created && created >= previousStart && created < currentStart;
  });

  const paidCurrent = currentBookings.filter((booking) => getStatus(booking) === 'paid');
  const paidPrevious = previousBookings.filter((booking) => getStatus(booking) === 'paid');

  const currentRevenue = paidCurrent.reduce((sum, booking) => sum + getBookingValue(booking), 0);
  const previousRevenue = paidPrevious.reduce((sum, booking) => sum + getBookingValue(booking), 0);

  const uniqueCustomers = new Set(paidCurrent.map(getCustomerKey)).size || new Set(bookings.map(getCustomerKey)).size;
  const bookingVelocity = currentBookings.length / spanDays;
  const paidShare = currentBookings.length > 0 ? (paidCurrent.length / currentBookings.length) * 100 : 0;
  const customerLtv = uniqueCustomers > 0 ? currentRevenue / uniqueCustomers : 0;

  return {
    currentRevenue,
    previousRevenue,
    revenueGrowth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : currentRevenue > 0 ? 100 : 0,
    currentBookings: currentBookings.length,
    previousBookings: previousBookings.length,
    bookingVelocity,
    paidShare,
    uniqueCustomers,
    customerLtv,
  };
};

const StatCard = ({
  title,
  value,
  note,
  change,
  changeType,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string;
  note?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subtitle?: string;
}) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
        <Icon size={24} />
      </div>
      {change ? (
        <span
          className={cn(
            'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
            changeType === 'negative'
              ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
              : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
          )}
        >
          {changeType === 'negative' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          {change}
        </span>
      ) : (
        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
          {subtitle ?? 'Live'}
        </span>
      )}
    </div>
    <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-1">{title}</p>
    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    {note && <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">{note}</p>}
  </div>
);

const Analytics = () => {
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [stats, setStats] = React.useState<SummaryStats>({
    totalBookings: 0,
    activeGuests: 0,
    pendingPayments: '$0.00',
  });
  const [range, setRange] = React.useState<RangeKey>('last12');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [bookingResponse, statsResponse] = await Promise.all([
          bookingService.getBookings().catch(() => ({ data: [] })),
          bookingService.getBookingStats().catch(() => null),
        ]);

        if (!mounted) return;

        const rows = Array.isArray(bookingResponse?.data) ? bookingResponse.data : [];
        setBookings(rows);
        setStats({
          totalBookings: toNumber(statsResponse?.total_bookings ?? rows.length),
          activeGuests: toNumber(statsResponse?.active_guests ?? 0),
          pendingPayments: String(statsResponse?.pending_payments ?? '$0.00'),
        });
      } catch (err) {
        if (mounted) {
          console.error('Failed to load analytics', err);
          setError('Unable to load analytics data from the backend.');
          setBookings([]);
          setStats({
            totalBookings: 0,
            activeGuests: 0,
            pendingPayments: '$0.00',
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = React.useMemo(() => calculateRangeMetrics(bookings, range), [bookings, range]);
  const trendData = React.useMemo(() => buildRevenueSeries(bookings, range), [bookings, range]);
  const mixData = React.useMemo(() => buildBookingMix(bookings), [bookings]);
  const topRoutes = React.useMemo(() => buildTopRoutes(bookings, range), [bookings, range]);

  const handleExport = async () => {
    if (exporting) return;
    try {
      setExporting(true);
      const blob = await bookingService.exportBookings({
        date_range: range === 'last30' ? 'last30' : 'all',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export analytics data', e);
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const cardSubtitle = range === 'last12' ? 'Compared with previous 12 months' : 'Compared with previous 30 days';

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Business Analytics</h3>
          <p className="text-sm text-slate-500 mt-1">Live metrics built from your real booking data.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm">
            <button
              type="button"
              onClick={() => setRange('last12')}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-lg transition-colors',
                range === 'last12'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200',
              )}
            >
              Last 12 Months
            </button>
            <button
              type="button"
              onClick={() => setRange('last30')}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-lg transition-colors',
                range === 'last30'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200',
              )}
            >
              Last 30 Days
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 font-bold text-sm hover:border-blue-600/30 hover:text-blue-600 transition-all shadow-sm"
          >
            {exporting ? <RefreshCcw size={18} className="animate-spin" /> : <Download size={18} />}
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Growth"
          value={loading ? '—' : `${metrics.revenueGrowth >= 0 ? '+' : '-'}${Math.abs(metrics.revenueGrowth).toFixed(1)}%`}
          change={loading ? undefined : `${metrics.revenueGrowth >= 0 ? '+' : '-'}${Math.abs(metrics.revenueGrowth).toFixed(1)}%`}
          changeType={metrics.revenueGrowth >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          note={loading ? 'Loading live bookings...' : `${cardSubtitle} · ${formatCurrency(metrics.currentRevenue)} revenue`}
        />
        <StatCard
          title="Customer LTV"
          value={loading ? '—' : formatCurrency(metrics.customerLtv)}
          change={loading ? undefined : `${metrics.uniqueCustomers} customers`}
          changeType="positive"
          icon={Users}
          note={loading ? 'Loading live bookings...' : 'Average revenue per unique customer'}
        />
        <StatCard
          title="Booking Velocity"
          value={loading ? '—' : `${metrics.bookingVelocity.toFixed(1)}/day`}
          change={loading ? undefined : `${metrics.currentBookings} bookings`}
          changeType="positive"
          icon={CalendarDays}
          note={loading ? 'Loading live bookings...' : `Across the selected ${range === 'last12' ? '12 months' : '30 days'}`}
        />
        <StatCard
          title="Paid Share"
          value={loading ? '—' : formatPercent(metrics.paidShare)}
          change={loading ? undefined : `${stats.totalBookings} total bookings`}
          changeType="positive"
          icon={Sparkles}
          note={loading ? 'Loading live bookings...' : `Pending payments: ${stats.pendingPayments}`}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">Revenue Growth Trend</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Paid booking revenue for the selected period</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              <Filter size={14} /> {range === 'last12' ? 'Yearly' : 'Daily'}
            </div>
          </div>
          <div className="h-[420px] w-full p-4">
            {loading ? (
              <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                Loading analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(toNumber(value))}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#analyticsRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-lg">Booking Mix</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Real booking categories from the backend</p>
            </div>
            <RouteIcon size={20} className="text-slate-400" />
          </div>

          <div className="h-[260px]">
            {loading ? (
              <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                Loading mix...
              </div>
            ) : mixData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mixData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {mixData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={28} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                No booking data yet.
              </div>
            )}
          </div>

          <div className="mt-2 space-y-3">
            {mixData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-lg">Booking Volume</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">Bookings created in the selected window</p>
          </div>
          <div className="h-[320px] p-4">
            {loading ? (
              <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(toNumber(value))}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">Top Performing Routes</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Grouped from real booking route labels</p>
            </div>
            <MapPin size={20} className="text-slate-400" />
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500">
                Loading routes...
              </div>
            ) : topRoutes.length > 0 ? (
              topRoutes.map((route, index) => (
                <div
                  key={`${route.name}-${index}`}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{route.name}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{route.count} bookings</p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded-full',
                        route.growth >= 0
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
                      )}
                    >
                      {route.growth >= 0 ? '+' : ''}
                      {route.growth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatCurrency(route.revenue)}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Revenue</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500">
                No routes found yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500">Backend Stats</p>
              <h4 className="font-bold mt-1">Total Bookings</h4>
            </div>
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{loading ? '—' : stats.totalBookings}</p>
          <p className="mt-2 text-sm text-slate-500">From `GET /api/bookings/stats`</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500">Backend Stats</p>
              <h4 className="font-bold mt-1">Active Guests</h4>
            </div>
            <Users size={20} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{loading ? '—' : stats.activeGuests}</p>
          <p className="mt-2 text-sm text-slate-500">Paid bookings guest total</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500">Backend Stats</p>
              <h4 className="font-bold mt-1">Pending Payments</h4>
            </div>
            <Wallet size={20} className="text-amber-600" />
          </div>
          <p className="mt-4 text-3xl font-bold">{loading ? '—' : stats.pendingPayments}</p>
          <p className="mt-2 text-sm text-slate-500">From `GET /api/bookings/stats`</p>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
