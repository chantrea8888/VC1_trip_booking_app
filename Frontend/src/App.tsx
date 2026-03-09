<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { format, addDays } from 'date-fns';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RecommendationModal } from './components/common/RecommendationModal';
import { DestinationModal } from './components/common/DestinationModal';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ALL_HOTELS } from './data/hotels';
>>>>>>> chantrea/feature-customer

const AppContent = () => {
  const [view, setView] = useState('landing');
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
<<<<<<< HEAD
  const { user, logout } = useAuth();
=======
  const { user, logout, login } = useAuth();
  const previousUserRef = useRef(user);
>>>>>>> chantrea/feature-customer

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([1, 2]);
<<<<<<< HEAD
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
=======

  const normalizeText = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const toHotelShape = (item: any) => ({
    ...item,
    name: item?.name || item?.title || 'Selected Hotel',
    location: item?.location || 'Cambodia',
    price: item?.price || '$120',
    score: String(item?.rating || item?.score || '4.8'),
    reviews: item?.reviews || '100 reviews',
    image: item?.image,
    type: 'hotel'
  });
  
  // Initialize default dates from current day
  const today = new Date();
  const startDate = addDays(today, 7);
  const endDate = addDays(startDate, 7);
  const dateRangeString = `${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`;
>>>>>>> chantrea/feature-customer

  const [tripData, setTripData] = useState({
    title: "Adventure in Siem Reap",
    emoji: "🇰🇭",
    dates: dateRangeString,
<<<<<<< HEAD
    guests: "2 Adults",
    reference: "#TP-48291",
=======
    startDate: startDate,
    endDate: endDate,
    guests: "2 Adults",
    reference: "#TP-48291",
    destination: {
      name: "Siem Reap",
      country: "Cambodia",
      description: "Gateway to Angkor Wat and Khmer heritage.",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800"
    },
>>>>>>> chantrea/feature-customer
    hotel: {
      name: "Raffles Grand Hotel d'Angkor",
      location: "1 Vithei Charles de Gaulle, Siem Reap, Cambodia",
      roomType: "Landmark Garden View Room",
      guests: "2 Adults",
      price: 2450.00,
<<<<<<< HEAD
=======
      dailyPrice: 350.00,
>>>>>>> chantrea/feature-customer
      nights: 7,
      status: "Reserved",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
    },
    rental: {
      name: "Lexus LX570 SUV",
      pickup: "Siem Reap Angkor International (SAI)",
      features: "Automatic • Premium Interior",
      price: 560.00,
<<<<<<< HEAD
=======
      dailyPrice: 80.00,
>>>>>>> chantrea/feature-customer
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

<<<<<<< HEAD
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
=======
  const handleSearch = (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => {
    const trimmedQuery = query.trim();
    const guestsString = `${guests.adults} Adults${guests.children > 0 ? `, ${guests.children} Children` : ''}`;

    setTripData(prev => {
      let dateRangeString = prev.dates;
      let days = Number(prev.hotel?.nights) > 0 ? Number(prev.hotel.nights) : 1;

      if (dates.start && dates.end) {
        dateRangeString = `${format(dates.start, 'MMMM d')} - ${format(dates.end, 'MMMM d, yyyy')}`;
        const diffTime = Math.abs(dates.end.getTime() - dates.start.getTime());
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      }

      const destinationName = trimmedQuery || prev.destination?.name || 'Siem Reap';

      return {
        ...prev,
        title: `Adventure in ${destinationName}`,
        dates: dateRangeString,
        startDate: dates.start || prev.startDate,
        endDate: dates.end || prev.endDate,
        guests: guestsString,
        destination: {
          ...prev.destination,
          name: destinationName,
          description: trimmedQuery ? `Customized itinerary for ${destinationName}.` : prev.destination?.description
        },
        hotel: {
          ...prev.hotel,
          guests: guestsString,
          nights: days,
          price: (prev.hotel.dailyPrice || 350) * days
        },
        rental: {
          ...prev.rental,
          days: days,
          price: (prev.rental.dailyPrice || 80) * days
        }
      };
    });
  };

  const handleSelectRecommendation = (item: any) => {
    const recommendationType = String(item?.type || '').toLowerCase();

    if (recommendationType === 'hotel') {
      const sourceName = String(item?.name || item?.title || '');
      const normalizedSourceName = normalizeText(sourceName);
      const matchedHotelExact = ALL_HOTELS.find((hotel) => {
        const normalizedHotelName = normalizeText(String(hotel.name || ''));
        return normalizedHotelName === normalizedSourceName;
      });
      const matchedHotelLoose = ALL_HOTELS.find((hotel) => {
        const normalizedHotelName = normalizeText(String(hotel.name || ''));
        return normalizedHotelName.includes(normalizedSourceName) || normalizedSourceName.includes(normalizedHotelName);
      });
      const matchedHotel = matchedHotelExact || matchedHotelLoose;

      setSelectedRecommendation(null);
      setSelectedHotel({ ...(matchedHotel ? { ...matchedHotel, image: matchedHotel.image || item?.image } : toHotelShape(item)), backView: 'landing' });
      setReturnToPlanner(false);
      setView('hotel-details');
      return;
    }

    if (recommendationType === 'activity') {
      setSelectedRecommendation(null);
      setReturnToPlanner(false);
      setView('activities');
      return;
    }

    if (recommendationType === 'transport' || recommendationType === 'rental' || recommendationType === 'car' || recommendationType === 'ferry') {
      setSelectedRecommendation(null);
      setReturnToPlanner(false);
      setView('rentals');
      return;
    }

    setSelectedRecommendation(item);
  };

  const handleSelectDestination = (dest: any) => {
    if (dest?.name) {
      setTripData((prev: any) => ({
        ...prev,
        title: `Trip to ${dest.name}`,
        destination: {
          ...prev.destination,
          name: dest.name,
          country: dest.country || prev.destination?.country || "Cambodia",
          description: dest.description || prev.destination?.description,
          image: dest.image || prev.destination?.image
        }
      }));
    }

    if (dest?.source === 'trending') {
      setSelectedDestination(dest);
      return;
    }

    if (dest.type === 'hotel') {
      setSelectedHotel({ ...dest, backView: 'landing' });
>>>>>>> chantrea/feature-customer
      setView('hotel-details');
    } else {
      setSelectedDestination(dest);
    }
  };
<<<<<<< HEAD
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
=======

  const [returnToPlanner, setReturnToPlanner] = useState(false);

  const handleTripPlannerClick = () => {
    setReturnToPlanner(true);
    setView('trip-planner');
  };

  const handleLogout = () => {
    logout();
    setReturnToPlanner(false);
    setView('landing');
  };

  useEffect(() => {
    // Redirect to home after logout, regardless of where logout was triggered.
    if (previousUserRef.current && !user) {
      setReturnToPlanner(false);
      setSelectedRecommendation(null);
      setSelectedDestination(null);
      setSelectedHotel(null);
      setView('landing');
    }

    previousUserRef.current = user;
  }, [user]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Navbar 
        onLoginClick={() => setView('login')}
        user={user}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onHotelsClick={() => { setReturnToPlanner(false); setView('hotels'); }}
        onRentalsClick={() => { setReturnToPlanner(false); setView('rentals'); }}
        onHomeClick={() => { setReturnToPlanner(false); setView('landing'); }}
        onBookingsClick={() => { setReturnToPlanner(false); setView('bookings'); }}
        onTripPlannerClick={handleTripPlannerClick}
        onActivitiesClick={() => { setReturnToPlanner(false); setView('activities'); }}
        currentView={view}
      />

      <AppRoutes 
        view={view}
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
        onSearch={handleSearch}
        returnToPlanner={returnToPlanner}
        setReturnToPlanner={setReturnToPlanner}
      />

      <Footer
        onLoginClick={() => setView('login')}
        onHomeClick={() => {
          setReturnToPlanner(false);
          setView('landing');
        }}
        onTripPlannerClick={() => {
          setReturnToPlanner(true);
          setView('trip-planner');
        }}
        onBookingsClick={() => {
          setReturnToPlanner(false);
          setView('bookings');
        }}
        user={user}
      />

      <AnimatePresence>
>>>>>>> chantrea/feature-customer
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
<<<<<<< HEAD
      </AnimatePresence> */}
=======
      </AnimatePresence>
>>>>>>> chantrea/feature-customer
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
<<<<<<< HEAD
      <AppContent />
=======
      <AuthProvider>
        <AppContent />
      </AuthProvider>
>>>>>>> chantrea/feature-customer
    </ThemeProvider>
  );
};

export default App;
