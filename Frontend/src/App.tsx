import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { AppRoutes } from './routes/AppRoutes';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { messageService } from './services/messageService';

type AppErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, AppErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App shell render error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Komrong</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">The page could not load</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              A runtime error stopped the app from rendering. Please refresh the page, and if it still fails,
              send me the error text below so I can fix the exact crash.
            </p>
            <pre className="mt-5 overflow-auto rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
              {this.state.error?.message || 'Unknown render error'}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const createEmptyTripData = () => ({
  title: '',
  emoji: '',
  dates: '',
  guests: '2 Adults',
  reference: `#TP-${String(Date.now()).slice(-5)}`,
  destination: {
    name: '',
    country: '',
    description: '',
    image: '',
  },
  hotel: {
    name: '',
    location: '',
    roomType: '',
    guests: '2 Adults',
    dailyPrice: 0,
    price: 0,
    nights: 1,
    status: 'Not booked',
    isBooked: false,
    image: '',
  },
  rental: {
    name: '',
    pickup: '',
    features: '',
    dailyPrice: 0,
    price: 0,
    days: 1,
    status: 'Not booked',
    isBooked: false,
    image: '',
  },
});

const AppContent = () => {
  const [view, setView] = useState('landing');
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [browseDestination, setBrowseDestination] = useState<any | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const isAdminUser = user?.role === 'admin';
  const isOwnerUser = user?.role === 'owner';
  
  const [tripData, setTripData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('customer_trip_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...createEmptyTripData(),
            ...parsed,
            hotel: { ...createEmptyTripData().hotel, ...(parsed.hotel || {}) },
            rental: { ...createEmptyTripData().rental, ...(parsed.rental || {}) },
            destination: { ...createEmptyTripData().destination, ...(parsed.destination || {}) },
          };
        }
      }
    } catch {
      /* ignore storage parse errors */
    }

    return createEmptyTripData();
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Booking Confirmed", message: "Your stay at Raffles Grand Hotel is confirmed for Oct 12.", time: "2h ago", type: "booking", read: false },
    { id: 2, title: "New Message", message: "Owner of Paradise Beach Resort sent you a message.", time: "5h ago", type: "message", read: false },
    { id: 3, title: "Price Drop", message: "Koh Rong ferry prices just dropped by 15%!", time: "1d ago", type: "alert", read: true },
  ]);

  const normalizeMessagePayload = (payload: any) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.messages)) return payload.messages;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.conversation)) return payload.conversation;
    if (Array.isArray(payload.results)) return payload.results;
    return [];
  };

  const formatRelativeFromNow = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const loadMessageNotifications = async () => {
    try {
      if (!user) return;

      const raw = user.role === 'owner'
        ? await messageService.getOwnerMessages()
        : await messageService.getCustomerMessages();

      const messages = normalizeMessagePayload(raw);
      const isCurrentUser = String(user?.id);

      const ownerMessages = messages
        .filter((m: any) => m.sender && String(m.sender_id) !== isCurrentUser)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((m: any) => {
          const sender = m.sender || {};
          const senderName = sender.full_name?.trim() || sender.name?.trim() || sender.email?.split('@')[0] || 'Owner';
          return {
            id: `message-${m.id}`,
            title: `New message from ${senderName}`,
            message: m.message || (m.content ?? 'You have a new message'),
            time: m.created_at ? formatRelativeFromNow(m.created_at) : 'Just now',
            type: 'message',
            read: Boolean(m.read_at),
            data: {
              conversationId: sender.id ?? m.sender_id ?? null,
              conversationEmail: sender.email ?? null,
              conversationName: senderName,
              conversationAvatar: sender.avatar ?? null,
            },
          };
        });

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.type !== 'message');
        const unique = ownerMessages.filter((n: any) => !filtered.some((x) => String(x.id) === String(n.id)));
        return [...unique, ...filtered];
      });
    } catch (error) {
      console.error('Failed to load message notifications', error);
    }
  };

  useEffect(() => {
    try {
      sessionStorage.setItem('customer_trip_data', JSON.stringify(tripData));
    } catch {
      /* ignore storage quota issues */
    }
  }, [tripData]);

  useEffect(() => {
    if (!user) return;
    void loadMessageNotifications();
  }, [user]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleSelectRecommendation = (item: any) => {
    if (item.type === 'hotel') {
      setSelectedHotel(item);
      setView('hotel-details');
    } else {
      setSelectedRecommendation(item);
    }
  };

  const handleSelectDestination = (dest: any) => {
    if (dest.type === 'hotel') {
      setSelectedHotel(dest);
      setView('hotel-details');
    } else {
      setSelectedDestination(dest);
    }
  };

  const normalizeDestinationQuery = (value: string) => {
    const raw = String(value || '').trim();
    const compact = raw.toLowerCase().replace(/[\s,]+/g, ' ').replace(/[^a-z\s]/g, '').trim();
    const aliases: Record<string, string> = {
      'seim reap': 'Siem Reap',
      'siem reap': 'Siem Reap',
      'phnom penh': 'Phnom Penh',
      'sihanoukville': 'Sihanoukville',
      'koh rong': 'Koh Rong',
      'kampot': 'Kampot',
    };

    return aliases[compact] || raw;
  };

  const handleSearchDestination = (
    query: string,
    _dates: { start: Date | null; end: Date | null },
    _guests: { adults: number; children: number },
  ) => {
    const normalizedQuery = normalizeDestinationQuery(query);
    if (!normalizedQuery) return;

    setBrowseDestination({
      name: normalizedQuery,
      location: normalizedQuery,
      country: 'Cambodia',
      image: tripData.destination?.image || tripData.hotel?.image || '',
    });
    setView('hotels');
  };
  const isAuthModalOpen = view === 'login' || view === 'register';
  const mainView = isAuthModalOpen ? 'landing' : view;
  const shouldShowFooter = !isAdminUser && user === null;
  const handleAuthSuccess = (nextView: string) => {
    setView(nextView);
  };

  useEffect(() => {
    if (isAdminUser || isOwnerUser) return;

    const pathname = location.pathname;

    if (pathname.startsWith('/destinations') || pathname.startsWith('/hotels')) {
      if (view !== 'hotels') setView('hotels');
      return;
    }

    if (pathname.startsWith('/rentals')) {
      if (view !== 'rentals') setView('rentals');
      return;
    }

    if (pathname.startsWith('/activities')) {
      if (view !== 'activities') setView('activities');
      return;
    }

    if (pathname.startsWith('/trip-planner')) {
      if (view !== 'trip-planner') setView('trip-planner');
      return;
    }

    if (pathname.startsWith('/bookings')) {
      if (view !== 'bookings') setView('bookings');
      return;
    }

    if (pathname === '/map' && view !== 'map') {
      setView('map');
    }
  }, [isAdminUser, isOwnerUser, location.pathname, setView, view]);

  const leaveCustomerRouteIfNeeded = React.useCallback(() => {
    // Some pages are bound to explicit routes (e.g. `/customer/bookings`) and
    // ignore `view` changes. When navigating via the Navbar, move back to `/`
    // so the view-based screens (Home / My Plan / My booking) work everywhere.
    if (location.pathname.startsWith('/customer/')) {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {!isAdminUser && !isOwnerUser && (
        <Navbar
          onLoginClick={() => setView('login')}
          user={user}
          onLogout={logout}
          onProfileClick={(tab?: any) => {
            leaveCustomerRouteIfNeeded();
            handleProfileClick(tab);
          }}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onHotelsClick={() => {
            leaveCustomerRouteIfNeeded();
            setView('hotels');
          }}
          onRentalsClick={() => {
            leaveCustomerRouteIfNeeded();
            setView('rentals');
          }}
          onHomeClick={() => {
            leaveCustomerRouteIfNeeded();
            setView('landing');
          }}
          onBookingsClick={() => {
            leaveCustomerRouteIfNeeded();
            setView('bookings');
          }}
          onTripPlannerClick={() => {
            leaveCustomerRouteIfNeeded();
            setView('trip-planner');
          }}
          onActivitiesClick={() => {
            leaveCustomerRouteIfNeeded();
            setView('activities');
          }}
          currentView={view}
        />
      )}

      {isAdminUser ? (
        <AppRoutes
          view={mainView}
          setView={setView}
          onSelectRecommendation={handleSelectRecommendation}
          onSelectDestination={handleSelectDestination}
          onPromotionsClick={() => setView('promotions')}
          onHotelsClick={() => setView('hotels')}
          onRentalsClick={() => setView('rentals')}
          onActivitiesClick={() => setView('activities')}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          activeProfileTab={activeProfileTab}
          selectedHotel={selectedHotel}
          browseDestination={browseDestination}
          setSelectedHotel={setSelectedHotel}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          tripData={tripData}
          setTripData={setTripData}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={mainView}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={isOwnerUser ? undefined : "pt-24"}
          >
            <AppRoutes
              view={mainView}
              setView={setView}
              onSelectRecommendation={handleSelectRecommendation}
              onSelectDestination={handleSelectDestination}
              onPromotionsClick={() => setView('promotions')}
              onHotelsClick={() => setView('hotels')}
              onRentalsClick={() => setView('rentals')}
              onActivitiesClick={() => setView('activities')}
              onSearchDestination={handleSearchDestination}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              activeProfileTab={activeProfileTab}
              selectedHotel={selectedHotel}
              browseDestination={browseDestination}
              setSelectedHotel={setSelectedHotel}
              selectedActivityIds={selectedActivityIds}
              setSelectedActivityIds={setSelectedActivityIds}
              tripData={tripData}
              setTripData={setTripData}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {shouldShowFooter && (
        <Footer
          onLoginClick={() => setView('login')}
          onHomeClick={() => {
            setView('landing');
            navigate('/');
          }}
          onTripPlannerClick={() => {
            setView('trip-planner');
            navigate('/trip-planner');
          }}
          onBookingsClick={() => {
            setView('bookings');
            navigate('/bookings');
          }}
          onHotelsClick={() => {
            setView('hotels');
            navigate('/hotels');
          }}
          onRentalsClick={() => {
            setView('rentals');
            navigate('/rentals');
          }}
          onActivitiesClick={() => {
            setView('activities');
            navigate('/activities');
          }}
          onTourGuidesClick={() => {
            setView('tour-guides');
            navigate('/');
          }}
          user={user}
        />
      )}

      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-slate-950/55 backdrop-blur-[1px] overflow-y-auto"
            onClick={() => setView('landing')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'login' ? (
                <Login
                  onSwitchToRegister={() => setView('register')}
                  onBack={() => setView('landing')}
                  onSuccess={handleAuthSuccess}
                  onClose={() => setView('landing')}
                />
              ) : (
                <Register
                  onSwitchToLogin={() => setView('login')}
                  onBack={() => setView('landing')}
                  onSuccess={handleAuthSuccess}
                  onClose={() => setView('landing')}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const App = () => {
  return (
    <>
        <ThemeProvider>
        <AppErrorBoundary>
          <AppContent />
        </AppErrorBoundary>
      </ThemeProvider>
      
    </>
  );
};

export default App;
