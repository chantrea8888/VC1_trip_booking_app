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
  Area,
} from 'recharts';
import { cn, formatRelativeTime } from '@/utils/utils';
import { MOCK_REVENUE_DATA } from '@/routes/constants';
import { useOwnerNotifications } from '@/context/OwnerNotificationsContext';
import { useLocation, useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, change, changeType, icon: Icon, subtitle }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
        <Icon size={24} />
      </div>
      {change && (
        <span
          className={cn(
            'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
            changeType === 'positive'
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10',
          )}
        >
          {changeType === 'positive' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </span>
      )}
      {!change && subtitle && (
        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
          {subtitle}
        </span>
      )}
    </div>
    <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-1">{title}</p>
    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    {title === 'Total Revenue' && (
      <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> vs. $11,248.00 last month
      </p>
    )}
    {title === 'Total Bookings' && (
      <p className="text-[11px] text-blue-600 mt-3 font-bold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> 24 bookings pending
      </p>
    )}
    {title === 'Average Rating' && (
      <div className="flex items-center gap-3 mt-3">
        <div className="flex text-amber-400">
          {[...Array(4)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
          <Star size={14} />
        </div>
        <p className="text-[11px] text-slate-400 font-medium">Based on 1,240 reviews</p>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, loading, markRead, openNotification } = useOwnerNotifications();
  const recentActivities = React.useMemo(
    () => notifications.slice(0, 4),
    [notifications],
  );

  React.useEffect(() => {
    if (location.hash !== '#recent-activities') return;
    const el = document.getElementById('recent-activities');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <button className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg" type="button">
          <Ticket size={18} />
          New Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$15,892" change="+12.5%" changeType="positive" icon={CreditCard} />
        <StatCard title="Total Bookings" value="1,240" change="+8.2%" changeType="positive" icon={Ticket} />
        <StatCard title="Average Rating" value="4.8" subtitle="Excellent" icon={Star} />
        <StatCard title="Active Listings" value="18" change="-2" changeType="negative" icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold">Revenue Overview</h4>
            <div className="flex gap-2">
              <button className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-600 text-white" type="button">
                Weekly
              </button>
              <button className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500" type="button">
                Monthly
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div id="recent-activities" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold">Recent Activities</h4>
              <button
                onClick={() => navigate('/bookings')}
                className="text-xs text-blue-600 font-bold hover:bg-blue-600/5 px-2 py-1 rounded transition-colors uppercase tracking-wider"
                type="button"
              >
                View All
              </button>
            </div>
            <div className="space-y-6">
              {loading && recentActivities.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">Loading recent activityâ€¦</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">No recent activity yet.</p>
              ) : (
                recentActivities.map((n, i) => {
                  const Icon = n.bookingId ? CalendarCheck : CheckCircle2;
                  const time = formatRelativeTime(n.createdAt);

                  return (
                    <button
                      key={String(n.id)}
                      onClick={async () => {
                        if (!n.readAt) await markRead(n.id);
                        openNotification(n);
                      }}
                      className="w-full text-left flex gap-4 group"
                      type="button"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className={cn('flex-1 pb-4', i !== recentActivities.length - 1 && 'border-b border-slate-50 dark:border-slate-800/50')}>
                        <p className="text-sm font-bold">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{n.message ?? ''}</p>
                        {time && <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">{time}</span>}
                      </div>
                      {!n.readAt && <span className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-xl border border-blue-600/10 dark:border-blue-600/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Rocket size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-600 mb-1">Performance Tip</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Update your Mondulkiri routes for the upcoming Water Festival to capture peak holiday traffic.
                </p>
                <button className="mt-4 text-[10px] font-extrabold text-blue-600 flex items-center gap-1 uppercase tracking-[0.1em] hover:gap-2 transition-all" type="button">
                  Update Now <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full p-3 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-between" type="button">
              Add New Listing <ArrowUpRight size={18} />
            </button>
            <button className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between" type="button">
              View Messages <MessageSquare size={18} />
            </button>
            <button className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between" type="button">
              Analytics Report <TrendingUp size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold">Upcoming Bookings</h4>
            <button className="text-xs text-blue-600 font-bold hover:underline" type="button">
              View Calendar
            </button>
          </div>
          <div className="space-y-4">
            {[
              { guest: 'Sarah Johnson', property: 'Angkor View Hotel', date: 'Today', time: '2:00 PM', status: 'confirmed' },
              { guest: 'Mike Chen', property: 'Beach Resort', date: 'Tomorrow', time: '11:00 AM', status: 'pending' },
              { guest: 'Emma Davis', property: 'Mountain Lodge', date: 'Mar 28', time: '4:00 PM', status: 'confirmed' },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <CalendarCheck size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{booking.guest}</p>
                    <p className="text-xs text-slate-500">{booking.property}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {booking.date} â€¢ {booking.time}
                  </p>
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-1 rounded-full',
                      booking.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
                    )}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold mb-4">Messages</h4>
          <div className="space-y-4">
            {[
              { name: 'John Smith', message: 'Is early check-in available?', time: '5 min ago', unread: true },
              { name: 'Lisa Wong', message: 'Thank you for the great stay!', time: '2 hours ago', unread: false },
              { name: 'David Brown', message: 'Can I modify my booking?', time: '1 day ago', unread: true },
            ].map((msg, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <MessageSquare size={18} className="text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white">{msg.name}</p>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{msg.message}</p>
                </div>
                {msg.unread && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold mb-4">Recent Reviews</h4>
          <div className="space-y-4">
            {[
              { name: 'Alice Green', rating: 5, review: 'Amazing experience! Highly recommend.', time: '2 days ago' },
              { name: 'Bob Wilson', rating: 4, review: 'Great service, clean rooms.', time: '1 week ago' },
            ].map((review, index) => (
              <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-900 dark:text-white">{review.name}</p>
                  <span className="text-xs text-slate-400">{review.time}</span>
                </div>
                <div className="flex text-amber-400 mb-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{review.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold">Performance Metrics</h4>
          <button className="text-xs text-blue-600 font-bold hover:underline" type="button">
            View Details
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">98%</p>
            <p className="text-sm text-slate-500">Response Rate</p>
            <div className="flex items-center justify-center gap-1 text-emerald-600 mt-2">
              <ArrowUpRight size={16} />
              <span className="text-xs font-bold">+2%</span>
            </div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">4.9</p>
            <p className="text-sm text-slate-500">Guest Satisfaction</p>
            <div className="flex items-center justify-center gap-1 text-emerald-600 mt-2">
              <ArrowUpRight size={16} />
              <span className="text-xs font-bold">+0.1</span>
            </div>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">12h</p>
            <p className="text-sm text-slate-500">Avg Response Time</p>
            <div className="flex items-center justify-center gap-1 text-rose-600 mt-2">
              <ArrowDownRight size={16} />
              <span className="text-xs font-bold">-1h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
