import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Bus, 
  CalendarCheck, 
  MessageSquare, 
  Tag, 
  BarChart3, 
  Wallet, 
  Settings,
  User
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { apiRequest } from '@/services/api';
import { messageService } from '@/services/messageService';
import { BrandLogo } from '@/components/common/BrandLogo';

const Sidebar = () => {
  const [destinationsCount, setDestinationsCount] = React.useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [destRes, chatRes] = await Promise.all([
          apiRequest('/destinations'),
          messageService.getOwnerUnreadCount()
        ]);
        
        if (destRes?.data) {
          setDestinationsCount(Array.isArray(destRes.data) ? destRes.data.length : 0);
        }
        setUnreadMessages(Number(chatRes?.unread_count ?? 0));
      } catch (err) {
        console.error('Sidebar fetch error:', err);
      }
    };

    fetchCounts();
    // Refresh every 30 seconds to keep badges synced
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const ownerNav = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: MapPin, label: 'Destinations', path: '/destinations', count: destinationsCount },
    { icon: Bus, label: 'Transport', path: '/transport' },
    { icon: CalendarCheck, label: 'Bookings', path: '/bookings' },
    { icon: MessageSquare, label: 'Messages', path: '/messages', count: unreadMessages > 0 ? unreadMessages : null },
    { icon: Tag, label: 'Promotions', path: '/promotions' },
  ];

  const ownerInsights = [
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Wallet, label: 'Financials', path: '/financials' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 hidden lg:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo variant="mark" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">Komroung</h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Platform</span>
          </div>
        </div>
      </div>

      <nav className="mt-2 px-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400 dark:text-slate-500">Navigation</p>
        {ownerNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
              isActive 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn("transition-colors", "group-hover:text-blue-600 group-[.bg-blue-600]:text-white")} />
                <span className="font-semibold text-sm flex-1">{item.label}</span>
                {item.count !== undefined && item.count !== null && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    isActive 
                      ? "bg-white text-blue-600" 
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
                  )}>
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {ownerInsights.length > 0 && (
          <>
            <p className="px-3 mt-8 mb-2 text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400 dark:text-slate-500">Insights</p>
            {ownerInsights.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
              isActive 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
            )}
              >
                <item.icon size={20} className={cn("transition-colors", "group-hover:text-blue-600 group-[.bg-blue-600]:text-white")} />
                <span className="font-semibold text-sm">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <img 
            alt="User Profile" 
            className="w-10 h-10 rounded-full object-cover border border-white dark:border-slate-700 shadow-sm" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf1j8gZCAIYB9RtAz0xbUOZ2Wf5lv7Of09l86ZljBDTiN9S-1jrLFpggpyAWfXlmtqluOGo-u13JydHHQzTINF94E1AkZ8zOhdCzVoWb8DrjxajIqDptveyDTiBMLjvc-SOqLiScxuArSCmtoFwR3D0ML1IRVGOqcqhtsSAc90wGoBpypE37vZqFmqyasqPibC8tcaEQivPs7b-0Zm7qgds4LDwFHMCLCghjqsbb9gFiLM1dQRDvshaO0E1GzVdMRflmZpoVelNIg"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate leading-tight">Alex Sterling</p>
            <p className="text-[10px] text-blue-600 font-bold truncate uppercase tracking-wider">Premium Partner</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
