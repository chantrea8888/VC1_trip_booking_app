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
  Rocket
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
import { cn } from '@/src/utils/utils';
import { MOCK_REVENUE_DATA } from '@/src/routes/constants';

const StatCard = ({ title, value, change, changeType, icon: Icon, subtitle }: any) => (
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
          {[...Array(4)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          <Star size={14} />
        </div>
        <p className="text-[11px] text-slate-400 font-medium">Based on 1,240 reviews</p>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  return (
    <div className="p-8 max-w-[1440px] mx-auto space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$12,845.50" 
          change="14.2%" 
          changeType="positive" 
          icon={CreditCard} 
        />
        <StatCard 
          title="Total Bookings" 
          value="342" 
          change="8.1%" 
          changeType="positive" 
          icon={Ticket} 
        />
        <StatCard 
          title="Average Rating" 
          value="4.8" 
          subtitle="Stable" 
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
              <button className="px-4 py-1.5 bg-white dark:bg-slate-700 text-[11px] font-bold rounded-md shadow-sm text-blue-600">WEEKLY</button>
              <button className="px-4 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">MONTHLY</button>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA}>
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold">Recent Activities</h4>
              <button className="text-xs text-blue-600 font-bold hover:bg-blue-600/5 px-2 py-1 rounded transition-colors uppercase tracking-wider">View All</button>
            </div>
            <div className="space-y-6">
              {[
                { icon: CalendarCheck, title: 'Booking from Siem Reap', desc: 'Shared Shuttle • 2 Guests', time: '10 mins ago' },
                { icon: CreditCard, title: 'Payout successful', desc: 'ABA Bank • $1,240.00', time: '2 hours ago' },
                { icon: MessageSquare, title: 'Message from Sopheap', desc: 'Route timing question', time: '5 hours ago' },
                { icon: Star, title: 'New 5-star review', desc: '"Excellent service!"', time: 'Yesterday' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <activity.icon size={20} />
                  </div>
                  <div className={cn("flex-1 pb-4", i !== 3 && "border-b border-slate-50 dark:border-slate-800/50")}>
                    <p className="text-sm font-bold">{activity.title}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{activity.desc}</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">{activity.time}</span>
                  </div>
                </div>
              ))}
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
