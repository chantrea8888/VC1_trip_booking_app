import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
// import { RecommendationModal } from './components/common/RecommendationModal';
// import { DestinationModal } from './components/common/DestinationModal';
import { AppRoutes } from './routes/AppRoutes';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent = () => {
  const [view, setView] = useState('landing');
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout } = useAuth();

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([1, 2]);
  const isAdminUser = user?.role === 'admin';
  
  // Initialize real-time dates
  const today = new Date('2026-03-03T00:34:03-08:00');
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);
  const startDateString = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const endDateString = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dateRangeString = `${startDateString} - ${endDateString}`;

  const [tripData, setTripData] = useState({
    title: "Adventure in Siem Reap",
    emoji: "🇰🇭",
    dates: dateRangeString,
    guests: "2 Adults",
    reference: "#TP-48291",
    hotel: {
      name: "Raffles Grand Hotel d'Angkor",
      location: "1 Vithei Charles de Gaulle, Siem Reap, Cambodia",
      roomType: "Landmark Garden View Room",
      guests: "2 Adults",
      price: 2450.00,
      nights: 7,
      status: "Reserved",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
    },
    rental: {
      name: "Lexus LX570 SUV",
      pickup: "Siem Reap Angkor International (SAI)",
      features: "Automatic • Premium Interior",
      price: 560.00,
      days: 7,
      status: "Pending",
      isBooked: true,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800"
    }
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Booking Confirmed", message: "Your stay at Raffles Grand Hotel is confirmed for Oct 12.", time: "2h ago", type: "booking", read: false },
    { id: 2, title: "New Message", message: "Owner of Paradise Beach Resort sent you a message.", time: "5h ago", type: "message", read: false },
    { id: 3, title: "Price Drop", message: "Koh Rong ferry prices just dropped by 15%!", time: "1d ago", type: "alert", read: true },
  ]);

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
  const isAuthModalOpen = view === 'login' || view === 'register';
  const mainView = isAuthModalOpen ? 'landing' : view;
  const shouldShowFooter = !isAdminUser && user === null;
  const handleAuthSuccess = (nextView: string) => {
    setView(nextView);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {!isAdminUser && (
        <Navbar
          onLoginClick={() => setView('login')}
          user={user}
          onLogout={logout}
          onProfileClick={handleProfileClick}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onHotelsClick={() => setView('hotels')}
          onRentalsClick={() => setView('rentals')}
          onHomeClick={() => setView('landing')}
          onBookingsClick={() => setView('bookings')}
          onTripPlannerClick={() => setView('trip-planner')}
          onActivitiesClick={() => setView('activities')}
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
            className="pt-24"
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
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              activeProfileTab={activeProfileTab}
              selectedHotel={selectedHotel}
              setSelectedHotel={setSelectedHotel}
              selectedActivityIds={selectedActivityIds}
              setSelectedActivityIds={setSelectedActivityIds}
              tripData={tripData}
              setTripData={setTripData}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {shouldShowFooter && <Footer onLoginClick={() => setView('login')} user={user} />}

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

      {/* <AnimatePresence>
        {selectedRecommendation && (
          <RecommendationModal 
            item={selectedRecommendation} 
            onClose={() => setSelectedRecommendation(null)} 
          />
        )}
        {selectedDestination && (
          <DestinationModal 
            dest={selectedDestination} 
            onClose={() => setSelectedDestination(null)} 
          />
        )}
      </AnimatePresence> */}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
