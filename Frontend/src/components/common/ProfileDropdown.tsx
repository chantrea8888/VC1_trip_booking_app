import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ProfileDropdownProps {
  onClose: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  onSettingsClick?: () => void;
  user?: { name?: string; email?: string; role?: string } | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onClose,
  onLogoutClick,
  onProfileClick,
  onSettingsClick,
  user,
}) => {
  const { isDarkMode } = useTheme();

  const menuItems = [
    {
      icon: User,
      label: 'View Profile',
      onClick: () => {
        onProfileClick();
        onClose();
      },
    },
    {
      icon: Settings,
      label: 'Profile Settings',
      onClick: () => {
        if (onSettingsClick) {
          onSettingsClick();
        }
        onClose();
      },
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: onLogoutClick,
      isDanger: true,
      hoverColor: 'red',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-lg overflow-hidden z-50 ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-slate-200'
        }`}
      >
        {/* User Info */}
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
            }`}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f1f5f9&color=0f172a&size=64`}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm truncate ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-xs truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isDarkMode
                  ? 'hover:bg-slate-700 text-slate-300'
                  : 'hover:bg-slate-50 text-slate-700'
              } ${
                item.isDanger 
                  ? isDarkMode 
                    ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  : ''
              }`}
            >
              <item.icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight size={14} className="opacity-50" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
