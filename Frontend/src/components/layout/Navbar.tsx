import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Hotel, 
  Ship, 
  Compass, 
  Bell, 
  CheckCircle2, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';
import { BrandLogo } from '../common/BrandLogo';

interface NavbarProps {
  onLoginClick: () => void;
  user: { name: string; email?: string; avatar?: string; role?: string } | null;
  onLogout: () => void;
  onProfileClick: (tab?: any) => void;
  notifications: any[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onHotelsClick: () => void;
  onRentalsClick: () => void;
  onHomeClick: () => void;
  onBookingsClick: () => void;
  onTripPlannerClick: () => void;
  onActivitiesClick: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onLoginClick, 
  user, 
  onLogout, 
  onProfileClick, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onHotelsClick, 
  onRentalsClick,
  onHomeClick,
  onBookingsClick,
  onTripPlannerClick,
  onActivitiesClick,
  currentView
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPlanTripOpen, setIsPlanTripOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const showBookings = user?.role !== 'owner';
  const planMenuItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.04 * index, duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadMessageCount = notifications.filter(n => !n.read && n.type === 'message').length;
  const messageNotifications = notifications.filter(n => n.type === 'message');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRequestLogout = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogout();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-slate-900 shadow-md py-3' : 'bg-white dark:bg-slate-900 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onHomeClick}
        >
          <BrandLogo variant="mark" className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tighter">Komrong</span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mt-0.5">BOOKING TRIP APP</span>
          </div>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          <button 
            onClick={onHomeClick}
            className={`text-sm font-medium transition-colors ${currentView === 'landing' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`}
          >
            Home
          </button>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsPlanTripOpen(true)}
            onMouseLeave={() => setIsPlanTripOpen(false)}
          >
            <div className="flex items-center gap-1">
              <motion.button 
                onClick={onTripPlannerClick}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`text-sm font-medium transition-colors py-2 ${currentView === 'trip-planner' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`}
              >
                My Plan
              </motion.button>
              <motion.button 
                onMouseEnter={() => setIsPlanTripOpen(true)}
                onClick={() => setIsPlanTripOpen(!isPlanTripOpen)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 ${['hotels', 'rentals', 'destinations', 'activities'].includes(currentView) ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`}
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isPlanTripOpen ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>

            <AnimatePresence>
              {isPlanTripOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 py-4 z-50 overflow-hidden"
                >
                  <div className="px-6 py-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Your Journey</span>
                  </div>
                  <motion.button
                    custom={1}
                    variants={planMenuItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      onHotelsClick();
                      setIsPlanTripOpen(false);
                    }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-6 py-4 text-sm font-bold flex items-center gap-4 transition-all ${currentView === 'hotels' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-blue-500" />
                    </div>
                    Hotel
                  </motion.button>
                  <motion.button
                    custom={2}
                    variants={planMenuItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      onRentalsClick();
                      setIsPlanTripOpen(false);
                    }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-6 py-4 text-sm font-bold flex items-center gap-4 transition-all ${currentView === 'rentals' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Ship className="w-4 h-4 text-emerald-500" />
                    </div>
                    Rental
                  </motion.button>
                  <motion.button
                    custom={3}
                    variants={planMenuItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      onActivitiesClick();
                      setIsPlanTripOpen(false);
                    }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-6 py-4 text-sm font-bold flex items-center gap-4 transition-all ${currentView === 'activities' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Compass className="w-4 h-4 text-amber-500" />
                    </div>
                    Activities
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showBookings && (
            <button 
              onClick={onBookingsClick}
              className={`text-sm font-medium transition-colors ${currentView === 'bookings' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`}
            >
              My booking
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 py-6 z-50 overflow-hidden"
                  >
                    <div className="px-6 mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAllAsRead();
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                          {unreadMessageCount > 0 ? `${unreadMessageCount} Owner Message${unreadMessageCount > 1 ? 's' : ''}` : `${unreadCount} New`}
                        </span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto px-2">
                      {notifications.length > 0 ? (
                        notifications.map((n) => {
                          const messageIndex = messageNotifications.findIndex((m) => m.id === n.id) + 1;
                          const displayTitle = n.type === 'message' ? `${n.title} #${messageIndex}` : n.title;

                          return (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              onMarkAsRead(n.id);
                              onProfileClick('notifications');
                              setIsNotificationsOpen(false);
                            }}
                            className={`px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all mb-1 ${n.read ? 'opacity-60' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'booking' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                {n.type === 'booking' ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{displayTitle}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                                <p className="text-[9px] text-slate-400 mt-1 font-medium">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                        })
                      ) : (
                        <div className="py-12 text-center">
                          <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                          <p className="text-xs text-slate-400">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <div className="px-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={() => {
                          onProfileClick('notifications');
                          setIsNotificationsOpen(false);
                        }}
                        className="w-full text-center text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        View All Activity
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all"
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-56 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 py-4 z-50"
                  >
                    <div className="px-6 py-2 mb-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-4" />
                    <button 
                      onClick={() => {
                        onProfileClick('profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-6 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button 
                      onClick={() => {
                        onProfileClick('settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-6 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-4" />
                    <button 
                      onClick={handleRequestLogout}
                      className="w-full text-left px-6 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsNotificationsOpen(false);
              }}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <button 
                onClick={() => {
                  onHomeClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl"
              >
                Home
              </button>

              <div className="space-y-2 pt-2">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Plan</p>
                <button 
                  onClick={() => {
                    onHotelsClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-bold rounded-2xl flex items-center gap-3 ${currentView === 'hotels' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Hotel className="w-5 h-5" /> Hotel
                </button>

                <button 
                  onClick={() => {
                    onRentalsClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-bold rounded-2xl flex items-center gap-3 ${currentView === 'rentals' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Ship className="w-5 h-5" /> Rental
                </button>

                <button 
                  onClick={() => {
                    onActivitiesClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-bold rounded-2xl flex items-center gap-3 ${currentView === 'activities' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Compass className="w-5 h-5" /> Activities
                </button>
              </div>

              {showBookings && (
                <button 
                  onClick={() => {
                    onBookingsClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl"
                >
                  My booking
                </button>
              )}
              
              {user ? (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] mb-4">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">Explorer Member</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRequestLogout}
                    className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-4 rounded-2xl font-bold text-center"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="w-full bg-blue-600 text-white px-4 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100"
                >
                  Log in
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </nav>
  );
};
