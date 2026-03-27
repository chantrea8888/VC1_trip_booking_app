import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { DestinationModal } from './components/common/DestinationModal';
import { RecommendationModal } from './components/common/RecommendationModal';
import { HelpCenterLayout } from './components/layout/HelpCenterLayout';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

type MessageItem = {
  id: number | string;
  sender_id: number | string;
  receiver_id: number | string;
  message: string;
  created_at: string;
  sender?: {
    id: number | string;
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  receiver?: {
    id: number | string;
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'message' | 'alert';
  read: boolean;
  sourceMessageId?: number | string;
  conversationId?: number | string;
  conversationEmail?: string;
};

type PendingMessageThread = {
  ownerId?: number | string;
  ownerEmail?: string;
  ownerName?: string;
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const authToken = () => {
  const stores = [localStorage, sessionStorage];
  const keys = [
    'token',
    'access_token',
    'authToken',
    'auth_token',
    'api_token',
    'bearerToken',
    'bearer_token',
    'laravel_token',
  ];

  for (const store of stores) {
    for (const key of keys) {
      const value = store.getItem(key);
      if (value) return value;
    }

    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (!key || !key.toLowerCase().includes('token')) continue;
      const value = store.getItem(key);
      if (value) return value;
    }
  }

  return '';
};

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const truncate = (value: string, max = 120) => {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

const apiRequest = async (path: string) => {
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  const token = authToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const urlCandidates = API_BASE
    ? [`${API_BASE}${path}`, `${API_BASE}/api${path}`]
    : [`/api${path}`];

  let lastError: Error | null = null;

  for (const url of urlCandidates) {
    const response = await fetch(url, { headers });
    if (response.ok) return response.json();
    const text = await response.text();
    lastError = new Error(text || `Request failed with status ${response.status}`);
    if (response.status !== 404) throw lastError;
  }

  throw lastError || new Error('Request failed');
};

const AppContent = () => {
  const [view, setView] = useState('landing');
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout } = useAuth();
  const previousUserRef = useRef(user);
  const showPublicChrome = user?.role !== 'owner';

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);

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
      dailyPrice: 350.00,
      price: 0.00,
      nights: 7,
      status: "Not booked",
      isBooked: false,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
    },
    rental: {
      name: "Lexus LX570 SUV",
      pickup: "Siem Reap Angkor International (SAI)",
      features: "Automatic • Premium Interior",
      dailyPrice: 80.00,
      price: 0.00,
      days: 7,
      status: "Not booked",
      isBooked: false,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800"
    }
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: "Booking Confirmed", message: "Your stay at Raffles Grand Hotel is confirmed for Oct 12.", time: "2h ago", type: "booking", read: false },
    { id: 2, title: "Message from Owner", message: "Owner of Paradise Beach Resort sent you a message.", time: "5h ago", type: "message", read: false },
    { id: 3, title: "Price Drop", message: "Koh Rong ferry prices just dropped by 15%!", time: "1d ago", type: "alert", read: true },
  ]);

  const openCustomerMessageThread = (notification: NotificationItem) => {
    const ownerName = notification.title.replace(/^(?:New message from|Message from)\s+/i, '') || 'Owner';
    const thread: PendingMessageThread = {
      ownerId: notification.conversationId || '',
      ownerEmail: notification.conversationEmail || '',
      ownerName,
    };

    sessionStorage.setItem(
      'pending_message_thread',
      JSON.stringify(thread),
    );
    setView('messages');
  };

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

  const handleTripPlannerClick = () => {
    setView('trip-planner');
  };

  const handleTourGuidesClick = () => {
    // Navigate to landing page and scroll to "Recommended for You" section
    setView('landing');
    
    // Scroll to the recommended section after component mounts
    setTimeout(() => {
      const element = document.getElementById('recommended-for-you');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleLogout = () => {
    void logout();
    setView('landing');
  };

  useEffect(() => {
    // Redirect to home after logout, regardless of where logout was triggered.
    if (previousUserRef.current && !user) {
      setSelectedRecommendation(null);
      setSelectedDestination(null);
      setSelectedHotel(null);
      setView('landing');
    }

    previousUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'customer') return;
    let alive = true;

    const loadLatestOwnerMessage = async () => {
      try {
        const response = await apiRequest('/customer/messages');
        const messages: MessageItem[] = response?.messages || [];
        const ownerMessage = messages.find((msg) => {
          const role = msg.sender?.role?.toLowerCase?.();
          if (role) return role === 'owner';
          return String(msg.sender_id) !== String(user.id);
        });

        if (!alive) return;

        if (!ownerMessage) return;

        const sender =
          ownerMessage.sender?.name ||
          ownerMessage.sender?.full_name ||
          ownerMessage.sender?.email ||
          'Owner';
        const preview = truncate(ownerMessage.message, 120);
        const timeLabel = formatRelativeTime(ownerMessage.created_at);

        setNotifications((prev) =>
          prev.map((n) => {
            if (n.id !== 2) return n;
            const sameMessage = (n as any).sourceMessageId === ownerMessage.id;
            const read = sameMessage ? n.read : false;
            return {
              ...n,
              title: `Message from ${sender}`,
              message: `${sender}: ${preview}`,
              time: timeLabel || n.time,
              read,
              type: 'message',
              sourceMessageId: ownerMessage.id,
              conversationId: ownerMessage.sender_id,
              conversationEmail: ownerMessage.sender?.email || '',
            };
          })
        );
      } catch {
        // Keep existing notification if messages endpoint is unavailable.
      }
    };

    loadLatestOwnerMessage();
    const timer = window.setInterval(loadLatestOwnerMessage, 20000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user || user.role !== 'customer') return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickedText = target.closest('button, a, div, li, article, section')?.textContent || '';
      const messageNotification = notifications.find((notification) => {
        if (notification.type !== 'message') return false;
        const titleHit = clickedText.includes(notification.title);
        const previewHit = clickedText.includes(notification.message.slice(0, 12));
        return titleHit || previewHit;
      });

      if (!messageNotification) return;

      openCustomerMessageThread(messageNotification);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [notifications, user?.role, user?.id]);

  return (
    <HelpCenterLayout showFloatingButton={false}>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        {showPublicChrome && (
          <Navbar 
            onLoginClick={() => setView('login')}
            user={user}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onHotelsClick={() => setView('hotels')}
            onRentalsClick={() => setView('rentals')}
            onHomeClick={() => setView('landing')}
            onBookingsClick={() => setView('bookings')}
            onTripPlannerClick={handleTripPlannerClick}
            onActivitiesClick={() => setView('activities')}
            currentView={view}
          />
        )}

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
        />

        {showPublicChrome && (
          <Footer
            onLoginClick={() => setView('login')}
            onHomeClick={() => {
              setView('landing');
            }}
            onTripPlannerClick={() => {
              setView('trip-planner');
            }}
            onBookingsClick={() => {
              setView('bookings');
            }}
            onHotelsClick={() => setView('hotels')}
            onRentalsClick={() => setView('rentals')}
            onActivitiesClick={() => setView('activities')}
            onTourGuidesClick={handleTourGuidesClick}
            user={user}
          />
        )}

        <AnimatePresence>
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
        </AnimatePresence>
      </div>
    </HelpCenterLayout>
  );
};

const App = () => {
  return (
    <>
        <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      
    </>
  );
};

export default App;
