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
import { cn } from '@/utils/utils';
import { getPromotions } from '@/services/promotionService';

type PromotionServiceCategory = 'hotel' | 'transport';

type PromotionStatus = 'active' | 'scheduled' | 'expired';

type Promotion = {
  id: string | number;
  name?: string;
  title?: string;
  type: string;
  discount_value?: number;
  discount_type?: string;
  discount?: string;
  status: PromotionStatus;
  reach?: string;
  start_date?: string;
  end: string;
  end_date?: string;
  expiry?: string;
  service_category?: PromotionServiceCategory;
  created_at?: string;
  is_active?: boolean;
  linked_destinations?: number[];
  linked_transports?: number[];
};


const Promotions = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | PromotionServiceCategory>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch promotions from database on mount
  React.useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getPromotions();
        // Transform database data to match frontend format
        const transformedPromotions = data.map((p: any) => {
          const linkedDestinations = Array.isArray(p?.linked_destinations) ? p.linked_destinations : [];
          const linkedTransports = Array.isArray(p?.linked_transports) ? p.linked_transports : [];
          const normalizedCategory =
            linkedDestinations.length && linkedTransports.length
                ? 'all'
                : typeof p?.service_category === 'string' && ['hotel', 'transport', 'all'].includes(p.service_category)
                  ? p.service_category
                  : linkedTransports.length
                    ? 'transport'
                    : 'hotel';

          return {
            ...p,
            id: p.id,
            name: p.title,
            title: p.title,
            discount: p.discount,
            type: p.type,
            status: p.is_active ? 'active' : 'expired',
            reach: '-',
            start_date: p.start_date || p.created_at || null,
            end: p.expiry || '-',
            end_date: p.expiry,
            code: p.code || '',
            color: p.color || '#3B82F6',
            service_category: normalizedCategory,
            linked_destinations: linkedDestinations,
            linked_transports: linkedTransports,
            created_at: p.created_at,
          };
        });
        setPromotions(transformedPromotions);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const filteredPromotions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return promotions
      .filter((p) => (categoryFilter === 'all' ? true : p.service_category === categoryFilter))
      .filter((p) => (q ? `${p.name} ${p.id}`.toLowerCase().includes(q) : true));
  }, [promotions, categoryFilter, searchTerm]);

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
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPromotions.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{campaign.name || campaign.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{campaign.id}</p>
                    {(campaign.linked_destinations?.length || campaign.linked_transports?.length) ? (
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">
                        {campaign.linked_destinations?.length ? `${campaign.linked_destinations.length} destinations` : ''}
                        {campaign.linked_destinations?.length && campaign.linked_transports?.length ? ', ' : ''}
                        {campaign.linked_transports?.length ? `${campaign.linked_transports.length} transports` : ''}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {campaign.service_category ? campaign.service_category : 'hotel'}
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
                  <td className="px-6 py-4 text-sm font-medium">
                    {campaign.start_date ? new Date(campaign.start_date).toISOString().slice(0, 10) : '-'}
                  </td>
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
