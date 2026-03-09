import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Sun, Moon } from 'lucide-react';
import { AdminNotification, NotificationDropdown } from '../common/NotificationDropdown';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';

interface HeaderProps {
  title: string;
  isDark: boolean;
  toggleTheme: () => void;
  onNotificationClick: (notification: AdminNotification) => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  user?: { name?: string; email?: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isDark,
  toggleTheme,
  onNotificationClick,
  onProfileClick,
  onLogoutClick,
  user,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  const avatarName = user?.name || 'User';
  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=f1f5f9&color=0f172a&size=128`;

  const handleLogoutClick = () => {
    setIsProfileDropdownOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogoutClick(); // Use the logout prop from parent component
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search businesses, owners, or destinations..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
            title={isDark ? "View Notifications" : "View Notifications"}

          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          <NotificationDropdown 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
            onNotificationClick={(notification) => {
              setIsNotificationsOpen(false);
              onNotificationClick(notification);
            }}
          />
        </div>

        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <HelpCircle size={20} />
        </button>
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-3 pl-3 pr-0.5 py-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open profile"
          >
            <span className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-primary/40 overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all">
              <img
                src={avatarSrc}
                alt={avatarName}
                className="w-full h-full object-cover"
              />
            </span>
          </button>
          
          {isProfileDropdownOpen && (
            <ProfileDropdown
              user={user}
              onClose={() => setIsProfileDropdownOpen(false)}
              onLogoutClick={handleLogoutClick}
              onProfileClick={onProfileClick}
            />
          )}
        </div>
      </div>
      
      <LogoutConfirmModal
              isOpen={isLogoutConfirmOpen}
              onCancel={() => setIsLogoutConfirmOpen(false)}
              onConfirm={handleConfirmLogout}
            />
    </header>
  );
};
