import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { format, addDays } from 'date-fns';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ALL_HOTELS } from './data/hotels';

const AppContent = () => {
  const [view, setView] = useState('landing');
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout, login } = useAuth();
  const previousUserRef = useRef(user);

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([1, 2]);

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

  const [tripData, setTripData] = useState({
    title: "Adventure in Siem Reap",
    emoji: "🇰🇭",
    dates: dateRangeString,
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
    hotel: {
      name: "Raffles Grand Hotel d'Angkor",
      location: "1 Vithei Charles de Gaulle, Siem Reap, Cambodia",
      roomType: "Landmark Garden View Room",
      guests: "2 Adults",
      price: 2450.00,
      dailyPrice: 350.00,
      nights: 7,
      status: "Reserved",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
    },
    rental: {
      name: "Lexus LX570 SUV",
      pickup: "Siem Reap Angkor International (SAI)",
      features: "Automatic • Premium Interior",
      price: 560.00,
      dailyPrice: 80.00,
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
      setView('hotel-details');
    } else {
      setSelectedDestination(dest);
    }
  };

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

      {/* Modals removed for now */}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
