import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  Map as MapIcon,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/src/utils/utils';
import { MOCK_ANALYTICS_REVENUE } from '@/src/routes/constants';

const Analytics = () => {
  const channelData = [
    { name: 'Direct', value: 45, color: '#3B82F6' },
    { name: 'OTA (Booking.com)', value: 30, color: '#10B981' },
    { name: 'Social Media', value: 15, color: '#F59E0B' },
    { name: 'Referral', value: 10, color: '#8B5CF6' },
  ];

  const satisfactionData = [
    { name: 'Mon', value: 4.2 },
    { name: 'Tue', value: 4.5 },
    { name: 'Wed', value: 4.8 },
    { name: 'Thu', value: 4.6 },
    { name: 'Fri', value: 4.9 },
    { name: 'Sat', value: 4.7 },
    { name: 'Sun', value: 4.8 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Business Analytics</h3>
          <p className="text-sm text-slate-500 mt-1">Deep dive into your performance metrics and growth trends.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 shadow-sm rounded-lg text-blue-600">Last 12 Months</button>
            <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">Last 30 Days</button>
          </div>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 font-bold text-xs hover:bg-slate-50 transition-all">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue Growth', value: '+24.5%', sub: 'vs last year', icon: TrendingUp, color: 'emerald' },
          { label: 'Customer LTV', value: '$452.00', sub: 'Avg. per user', icon: Users, color: 'blue' },
          { label: 'Booking Velocity', value: '4.2/day', sub: 'Trending up', icon: Calendar, color: 'blue' },
          { label: 'Market Share', value: '12.4%', sub: 'In Cambodia', icon: BarChart3, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
              )}>
                <stat.icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
              )}>
                {stat.color === 'emerald' ? <ArrowUpRight size={12} className="inline mr-1" /> : <ArrowUpRight size={12} className="inline mr-1" />}
                Active
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{stat.sub}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="font-bold text-lg">Revenue Growth Trend</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Monthly revenue analysis for the current fiscal year</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS_REVENUE}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(value) => `$${value/1000}k`}
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
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold">Booking Channels</h4>
            <PieChartIcon className="text-slate-400" size={20} />
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">1.2k</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {channelData.map((channel, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: channel.color }}></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{channel.name}</span>
                </div>
                <span className="text-xs font-bold">{channel.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold">Customer Satisfaction</h4>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg text-amber-500">
              <TrendingUp size={14} />
              <span className="text-xs font-bold">+0.4</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }}
                  domain={[0, 5]}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold">Top Performing Routes</h4>
            <MapIcon className="text-slate-400" size={20} />
          </div>
          <div className="space-y-6">
            {[
              { route: 'Phnom Penh — Siem Reap', bookings: '450', growth: '+12%', color: 'blue' },
              { route: 'Phnom Penh — Sihanoukville', bookings: '320', growth: '+8%', color: 'emerald' },
              { route: 'Siem Reap — Battambang', bookings: '180', growth: '-2%', color: 'rose' },
              { route: 'Kampot — Kep', bookings: '120', growth: '+15%', color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-all">
                    <MapIcon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.route}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.bookings} Bookings</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  item.color === 'emerald' ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" :
                  item.color === 'rose' ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20" :
                  "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                )}>
                  {item.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
