import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Bell, Cloud } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Phnom_Penh'
  });

  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8">
      <div className="flex items-center gap-12 flex-1">
        <h2 className="text-xl font-bold whitespace-nowrap">{title}</h2>
        <div className="hidden md:flex relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within:text-blue-600 transition-colors" />
          <input 
            className="bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-600/20 focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-12 pr-4 py-2.5 text-sm w-full focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400" 
            placeholder="Search analytics, bookings, and reports..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-600/5 rounded-xl transition-all"
          onClick={toggleDark}
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <div className="relative">
          <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-600/5 rounded-xl transition-all">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </button>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 pl-4 pr-1 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-none">Phnom Penh, KH</p>
            <p className="text-[10px] text-slate-500 font-medium">{formattedTime} ICT</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-blue-600 shadow-sm">
            <Cloud size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
