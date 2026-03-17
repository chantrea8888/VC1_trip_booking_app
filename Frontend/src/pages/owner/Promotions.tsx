import React from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  TrendingUp, 
  Users,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/utils';

type PromotionServiceCategory = 'hotel' | 'transport';

type PromotionStatus = 'active' | 'scheduled' | 'expired';

type Promotion = {
  id: string;
  name: string;
  type: string;
  discount: string;
  status: PromotionStatus;
  reach: string;
  conversions: string;
  end: string;
  serviceCategory?: PromotionServiceCategory;
};

const Promotions = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | PromotionServiceCategory>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const campaigns: Promotion[] = [
    { id: 'PROM-001', name: 'Water Festival Special', type: 'Discount', discount: '20%', status: 'active', reach: '12.4k', conversions: '840', end: 'Nov 15, 2024' },
    { id: 'PROM-002', name: 'Early Bird Siem Reap', type: 'Fixed Price', discount: '$15 Off', status: 'active', reach: '8.2k', conversions: '320', end: 'Dec 01, 2024' },
    { id: 'PROM-003', name: 'Weekend Beach Getaway', type: 'Bundle', discount: 'Free Drink', status: 'scheduled', reach: '-', conversions: '-', end: 'Nov 20, 2024' },
    { id: 'PROM-004', name: 'Mondulkiri Adventure', type: 'Discount', discount: '15%', status: 'expired', reach: '15.1k', conversions: '1.2k', end: 'Oct 15, 2024' },
  ];

  const storedPromotions: Promotion[] = React.useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('ownerPromotions') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const allPromotions = React.useMemo<Promotion[]>(() => {
    return [...storedPromotions, ...campaigns];
  }, [storedPromotions]);

  const filteredPromotions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allPromotions
      .filter((p) => (categoryFilter === 'all' ? true : p.serviceCategory === categoryFilter))
      .filter((p) => (q ? `${p.name} ${p.id}`.toLowerCase().includes(q) : true));
  }, [allPromotions, categoryFilter, searchTerm]);

  const stats = React.useMemo(() => {
    const activeCount = filteredPromotions.filter((p) => p.status === 'active').length;
    const totalReach = filteredPromotions.reduce((sum, p) => {
      const v = String(p.reach ?? '').toLowerCase();
      const num = parseFloat(v.replace(/[a-z]/g, ''));
      if (Number.isNaN(num)) return sum;
      const multiplier = v.includes('k') ? 1000 : v.includes('m') ? 1000000 : 1;
      return sum + num * multiplier;
    }, 0);
    const formattedReach = totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach.toFixed(0);
    return {
      activeCount,
      formattedReach,
      avgConversion: '8.4%',
    };
  }, [filteredPromotions]);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Promotions Management</h3>
          <p className="text-sm text-slate-500 mt-1">Create and track marketing campaigns to boost your bookings.</p>
        </div>
        <button 
          onClick={() => navigate('/promotions/new')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} /> Create New Promotion
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Campaigns', value: stats.activeCount.toString(), icon: Tag, color: 'blue' },
          { label: 'Total Reach', value: stats.formattedReach, icon: Users, color: 'emerald' },
          { label: 'Avg. Conversion', value: stats.avgConversion, icon: TrendingUp, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
              )}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900" 
              placeholder="Search campaigns..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  categoryFilter === 'all'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('hotel')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  categoryFilter === 'hotel'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                Hotel
              </button>
              <button
                onClick={() => setCategoryFilter('transport')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  categoryFilter === 'transport'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                Transport
              </button>
            </div>
            <button className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Discount/Offer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reach</th>
                <th className="px-6 py-4">Conversions</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPromotions.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{campaign.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{campaign.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {campaign.serviceCategory ? campaign.serviceCategory : 'hotel'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{campaign.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-blue-600">{campaign.discount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full",
                      campaign.status === 'active' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                      campaign.status === 'scheduled' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                      "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                      {campaign.status === 'active' ? <CheckCircle2 size={12} /> : campaign.status === 'scheduled' ? <Clock size={12} /> : <AlertCircle size={12} />}
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{campaign.reach}</td>
                  <td className="px-6 py-4 text-sm font-medium">{campaign.conversions}</td>
                  <td className="px-6 py-4 text-sm font-medium">{campaign.end}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Promotions;
