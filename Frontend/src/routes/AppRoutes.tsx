import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AdminNotification } from '@/components/common/NotificationDropdown';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import VisitorHome from '@/pages/public/VisitorHome';
import { Dashboard as CustomerDashboard } from '@/pages/customer/Dashboard';
import { Hotels } from '@/pages/customer/Destinations';
import { HotelDetails } from '@/pages/customer/HotelDetails';
import { TripPlanner } from '@/pages/customer/TripPlanner';
import { BookingHistory } from '@/pages/customer/BookingHistory';
import { GroupInvite } from '@/pages/customer/GroupInvite';
import { GroupPlanning } from '@/pages/customer/GroupPlanning';
import { Rentals } from '@/pages/customer/Rentals';
import { Activities } from '@/pages/customer/Activities';
import { Profile } from '@/pages/customer/Profile';
import { Promotions } from '@/pages/customer/Promotions';
import { BookTrip } from '@/pages/customer/BookTrip';
import { CustomerBookings } from '@/pages/customer/CustomerBookings';
import CustomerMessagesPage from '@/pages/customer/Messages';
import Payment from '@/pages/customer/Payment';
import MapPage from '@/pages/MapPage';
import OwnerDashboard from '@/pages/owner/Dashboard';
import OwnerDestinations from '@/pages/owner/Destinations';
import OwnerTransport from '@/pages/owner/Transport';
import OwnerBookings from '@/pages/owner/Bookings';
import OwnerMessages from '@/pages/owner/Messages';
import OwnerPromotions from '@/pages/owner/Promotions';
import OwnerCreatePromotion from '@/pages/owner/CreatePromotion';
import OwnerAnalytics from '@/pages/owner/Analytics';
import OwnerFinancials from '@/pages/owner/Financials';
import OwnerSettings from '@/pages/owner/Settings';
import OwnerProfile from '@/pages/owner/Profile';
import OwnerRegisterVehicle from '@/pages/owner/RegisterVehicle';
import OwnerPropertyDetail from '@/pages/owner/PropertyDetail';
import OwnerAddRoom from '@/pages/owner/AddRoom';
import OwnerAddProperty from '@/pages/owner/AddProperty';
import OwnerEditProperty from '@/pages/owner/EditProperty';
import { useLocation, useNavigate } from 'react-router-dom';
import OwnerSidebar from '@/components/layout/owner/Sidebar';
import { OwnerNotificationsProvider, useOwnerNotifications } from '@/context/OwnerNotificationsContext';
import { bookingService } from '@/services/bookingService';
import { messageService } from '@/services/messageService';
import { formatRelativeTime } from '@/utils/utils';
import { OwnerNotificationModal } from '@/components/owner/OwnerNotificationModal';
import {
  Dashboard as AdminDashboard,
  UserManagement,
  OwnerManagement,
  OwnerDetailsPage,
  ViewAllApplications,
  OwnerApplicationDetails,
  Destinations as AdminDestinations,
  Bookings as AdminBookings,
  Finances,
  AuditLogs,
  Settings,
  AdminProfile,
} from '@/pages/admin';

interface AppRoutesProps {
  view: string;
  setView: (view: string) => void;
  onSelectRecommendation: (item: any) => void;
  onSelectDestination: (dest: any) => void;
  onSearchDestination?: (query: string, dates: { start: Date | null; end: Date | null }, guests: { adults: number; children: number }) => void;
  onPromotionsClick: () => void;
  onHotelsClick: () => void;
  onRentalsClick: () => void;
  onActivitiesClick: () => void;
  notifications: any[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  activeProfileTab: any;
  selectedHotel: any | null;
  browseDestination?: any | null;
  hotelBackView?: string;
  setSelectedHotel: (hotel: any | null) => void;
  selectedActivityIds: number[];
  setSelectedActivityIds: React.Dispatch<React.SetStateAction<number[]>>;
  tripData: any;
  setTripData: React.Dispatch<React.SetStateAction<any>>;
}

type ClaimedPromotion = {
  id: number;
  title: string;
  discount: string;
  code: string;
  originalPrice: string;
  promoPrice: string;
};

type AdminView =
  | 'dashboard'
  | 'users'
  | 'owners'
  | 'owners-applications'
  | 'owners-applications-details'
  | 'owners-details'
  | 'destinations'
  | 'bookings'
  | 'finances'
  | 'logs'
  | 'settings'
  | 'profile';

const normalizeAdminView = (view: string): AdminView => {
  switch (view) {
    case 'users':
    case 'owners':
    case 'owners-applications':
    case 'owners-applications-details':
    case 'owners-details':
    case 'destinations':
    case 'bookings':
    case 'finances':
    case 'logs':
    case 'settings':
    case 'profile':
      return view;
    case 'admin-dashboard':
    case 'landing':
    default:
      return 'dashboard';
  }
};

const getOwnerTitle = (pathname: string): string => {
  if (pathname.startsWith('/transport')) return 'Transport';
  if (pathname.startsWith('/bookings')) return 'Bookings';
  if (pathname.startsWith('/messages')) return 'Messages';
  if (pathname.startsWith('/promotions')) return 'Promotions';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname.startsWith('/financials')) return 'Financials';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/destinations')) return 'Destinations';
  if (pathname.startsWith('/profile')) return 'Profile';
  return 'Overview Dashboard';
};

const OwnerShellInner: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [ownerNotifications, setOwnerNotifications] = React.useState<AdminNotification[]>([]);

  const formatRelativeTime = (iso: string | null | undefined) => {
    if (!iso) return '';
    const createdAt = new Date(iso).getTime();
    if (Number.isNaN(createdAt)) return '';
    const diffMs = Date.now() - createdAt;
    const diffMin = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} mins ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hours ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} days ago`;
  };

  const refreshOwnerNotifications = React.useCallback(async () => {
    try {
      const res = await bookingService.getOwnerNotifications({ limit: 25 });
      const items = (res?.data ?? res?.data?.data ?? res?.data?.notifications ?? res?.data) as any;
      const list = Array.isArray(items?.data) ? items.data : Array.isArray(items) ? items : [];

      const mapped: AdminNotification[] = list.map((n: any) => ({
        id: String(n.id),
        title: String(n.title ?? 'Notification'),
        description: String(n.message ?? n.description ?? ''),
        time: formatRelativeTime(n.createdAt ?? n.created_at),
        type: 'booking',
        read: Boolean(n.readAt ?? n.read_at),
        bookingId: n.bookingId ?? n.booking_id ?? null,
        data: n.data ?? null,
      }));

      setOwnerNotifications(mapped);
    } catch (e) {
      // Best effort: keep the app usable even if notifications fail.
      console.error('Failed to fetch owner notifications', e);
    }
  }, []);

  React.useEffect(() => {
    refreshOwnerNotifications();
    const timer = window.setInterval(() => refreshOwnerNotifications(), 15000);
    return () => window.clearInterval(timer);
  }, [refreshOwnerNotifications]);

  const markOwnerNotificationRead = async (id: string) => {
    try {
      await bookingService.markOwnerNotificationRead(id);
    } finally {
      setOwnerNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const markAllOwnerNotificationsRead = async () => {
    try {
      await bookingService.markAllOwnerNotificationsRead();
    } finally {
      setOwnerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const openOwnerMessageThread = (notification: any) => {
    const thread = {
      ownerId: notification?.data?.conversationId ?? notification?.conversationId ?? '',
      ownerEmail: notification?.data?.conversationEmail ?? notification?.conversationEmail ?? '',
      ownerName:
        notification?.data?.conversationName ??
        notification?.conversationName ??
        notification?.title?.replace(/^New message from\s+/i, '') ??
        'Owner',
      ownerAvatar: notification?.data?.conversationAvatar ?? notification?.conversationAvatar ?? '',
    };

    sessionStorage.setItem('pending_message_thread', JSON.stringify(thread));
    navigate('/messages');
  };

  const renderOwnerPage = () => {
    const path = location.pathname;
    const openBookingDetails = (bookingId: string) => {
      navigate(`/bookings?booking_id=${encodeURIComponent(String(bookingId))}`);
    };
    const viewAllActivities = () => navigate('/bookings');

    if (path === '/' || path === '/owner') return (
      <OwnerDashboard
        notifications={ownerNotifications}
        onOpenBooking={openBookingDetails}
        onOpenMessageThread={openOwnerMessageThread}
        onMarkNotificationRead={markOwnerNotificationRead}
        onViewAllActivities={viewAllActivities}
      />
    );
    if (path.startsWith('/destinations') && path.includes('/add-room')) return <OwnerAddRoom />;
    if (path.startsWith('/destinations') && path.includes('/edit')) return <OwnerEditProperty />;
    if (path.startsWith('/destinations') && path.includes('/new')) return <OwnerAddProperty />;
    if (path.startsWith('/destinations') && path !== '/destinations') return <OwnerPropertyDetail />;
    if (path.startsWith('/destinations')) return <OwnerDestinations />;

    if (path.startsWith('/transport/new')) return <OwnerRegisterVehicle />;
    if (path.startsWith('/transport')) return <OwnerTransport />;
    if (path.startsWith('/bookings')) return <OwnerBookings />;
    if (path.startsWith('/messages')) return <OwnerMessages />;
    if (path.startsWith('/promotions/new')) return <OwnerCreatePromotion />;
    if (path.startsWith('/promotions')) return <OwnerPromotions />;
    if (path.startsWith('/analytics')) return <OwnerAnalytics />;
    if (path.startsWith('/financials')) return <OwnerFinancials />;
    if (path.startsWith('/profile')) return <OwnerProfile />;
    if (path.startsWith('/settings')) return <OwnerSettings />;

    return (
      <OwnerDashboard
        notifications={ownerNotifications}
        onOpenBooking={openBookingDetails}
        onOpenMessageThread={openOwnerMessageThread}
        onMarkNotificationRead={markOwnerNotificationRead}
        onViewAllActivities={viewAllActivities}
      />
    );
  };

  const title = getOwnerTitle(location.pathname);

  // Clicking items in the bell dropdown is intentionally disabled for owners.
  // Owners open details via Overview → Recent Activities (or "View all notifications").

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-200">
      <OwnerSidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header
          title={title}
          isDark={isDarkMode}
          toggleTheme={toggleDarkMode}
          notifications={ownerNotifications}
          onMarkNotificationRead={markOwnerNotificationRead}
          onMarkAllNotificationsRead={markAllOwnerNotificationsRead}
          onNotificationClick={(n) => {
            const bookingId = n?.bookingId || n?.data?.id || null;
            if (bookingId) {
              navigate(`/bookings?booking_id=${encodeURIComponent(String(bookingId))}`);
              return;
            }
            navigate('/bookings');
          }}
          onProfileClick={() => {}}
          onLogoutClick={onLogout}
          user={user}
        />

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {renderOwnerPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const OwnerShell: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <OwnerNotificationsProvider>
      <OwnerShellInner onLogout={onLogout} />
    </OwnerNotificationsProvider>
  );
};

const getAdminTitle = (view: AdminView): string => {
  switch (view) {
    case 'dashboard':
      return 'Executive Overview';
    case 'users':
      return 'User Management';
    case 'owners':
      return 'Owners Management';
    case 'owners-applications':
      return 'Owner Applications';
    case 'owners-applications-details':
      return 'Owner Application Details';
    case 'owners-details':
      return 'Owner Details';
    case 'destinations':
      return 'Destinations Management';
    case 'bookings':
      return 'Bookings Management';
    case 'finances':
      return 'Finances Management';
    case 'logs':
      return 'System Audit Logs';
    case 'settings':
      return 'System Settings';
    case 'profile':
      return 'Admin Profile';
    default:
      return 'Executive Overview';
  }
};

const AdminShell: React.FC<{ view: string; setView: (view: string) => void; onLogout: () => void }> = ({
  view,
  setView,
  onLogout,
}) => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const normalizedView = normalizeAdminView(view);
  const activeTab = normalizedView.startsWith('owners') ? 'owners' : normalizedView;
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] = React.useState(false);
  const [pendingNavigationView, setPendingNavigationView] = React.useState<string | null>(null);

  const safeSetView = React.useCallback(
    (nextView: string) => {
      if (hasUnsavedProfileChanges && normalizedView === 'profile' && nextView !== 'profile') {
        setPendingNavigationView(nextView);
        return;
      }
      setView(nextView);
    },
    [hasUnsavedProfileChanges, normalizedView, setView],
  );

  const cancelPendingNavigation = () => setPendingNavigationView(null);
  const confirmPendingNavigation = () => {
    if (!pendingNavigationView) return;
    setHasUnsavedProfileChanges(false);
    setView(pendingNavigationView);
    setPendingNavigationView(null);
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    if (notification.id === '1') {
      safeSetView('owners-details');
    }
  };

  const renderAdminPage = () => {
    switch (normalizedView) {
      case 'dashboard':
        return (
          <AdminDashboard
            onOpenTotalUsersDetails={() => safeSetView('users')}
            onOpenTotalOwnersDetails={() => safeSetView('owners')}
            onOpenTotalBookingsDetails={() => safeSetView('bookings')}
            onOpenSystemIncomeDetails={() => safeSetView('finances')}
            onOpenOwnerApplicationsDetails={() => safeSetView('owners-applications')}
          />
        );
      case 'users':
        return <UserManagement />;
      case 'owners':
        return (
          <OwnerManagement
            onViewAllApplications={() => safeSetView('owners-applications')}
            onViewOwnerDetails={() => safeSetView('owners-details')}
          />
        );
      case 'owners-applications':
        return (
          <ViewAllApplications
            onBack={() => safeSetView('owners')}
            onViewDetails={() => safeSetView('owners-applications-details')}
          />
        );
      case 'owners-applications-details':
        return <OwnerApplicationDetails onBack={() => safeSetView('owners-applications')} />;
      case 'owners-details':
        return <OwnerDetailsPage onBack={() => safeSetView('owners')} />;
      case 'destinations':
        return <AdminDestinations />;
      case 'bookings':
        return <AdminBookings />;
      case 'finances':
        return <Finances />;
      case 'logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <AdminProfile onDirtyChange={setHasUnsavedProfileChanges} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => safeSetView(tab)}
        onProfileClick={() => safeSetView('profile')}
        onLogout={onLogout}
        user={user}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getAdminTitle(normalizedView)}
          isDark={isDarkMode}
          toggleTheme={toggleDarkMode}
          onNotificationClick={handleNotificationClick}
          onProfileClick={() => safeSetView('profile')}
          onSettingsClick={() => safeSetView('settings')}
          onLogoutClick={onLogout}
          user={user}
        />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={normalizedView}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {renderAdminPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {pendingNavigationView && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-40" onClick={cancelPendingNavigation} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unsaved Changes</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                You have unsaved profile changes. If you leave this page now, your edits will be lost.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={cancelPendingNavigation}
                  className="h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPendingNavigation}
                  className="h-10 px-4 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const AppRoutes: React.FC<AppRoutesProps> = ({
  view,
  setView,
  onSelectRecommendation,
  onSelectDestination,
  onSearchDestination,
  onPromotionsClick,
  onHotelsClick,
  onRentalsClick,
  onActivitiesClick,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  activeProfileTab,
  selectedHotel,
  browseDestination,
  hotelBackView,
  setSelectedHotel,
  selectedActivityIds,
  setSelectedActivityIds,
  tripData,
  setTripData,
}) => {
  const { user, logout } = useAuth();
  const isGuest = !user;
  const location = useLocation();

  const requireAuth = React.useCallback(() => {
    if (isGuest) {
      setView('login');
      return false;
    }
    return true;
  }, [isGuest, setView]);

  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    setView('hotel-details');
  };

  const handleReserveHotel = (selection: any) => {
    if (!requireAuth()) return;
    setTripData((prev: any) => {
      const next = { ...(prev || {}) };
      const startDate = selection?.checkInDate ? new Date(selection.checkInDate) : null;
      const endDate = selection?.checkOutDate ? new Date(selection.checkOutDate) : null;
      const destinationId =
        selectedHotel?.destination_id ??
        selectedHotel?.destinationId ??
        selectedHotel?.id ??
        next.hotel?.destination_id ??
        next.hotel?.destinationId ??
        null;
      next.hotel = {
        ...(next.hotel || {}),
        name: selectedHotel?.name ?? next.hotel?.name,
        location: selectedHotel?.location ?? next.hotel?.location,
        image: selectedHotel?.image ?? next.hotel?.image,
        owner: selectedHotel?.owner ?? next.hotel?.owner,
        roomType: selection?.roomType ?? next.hotel?.roomType,
        guests: String(selection?.guests ?? next.hotel?.guests ?? prev?.guests ?? '2 Adults'),
        nights: selection?.nights ?? next.hotel?.nights,
        price: selection?.totalPrice ?? selection?.roomSubtotal ?? next.hotel?.price,
        dailyPrice: selection?.nightlyPrice ?? next.hotel?.dailyPrice,
        destination_id: destinationId,
        destinationId,
        status: 'Reserved',
        // Promotion fields
        hasPromotion: selection?.hasPromotion ?? next.hotel?.hasPromotion,
        promotion: selection?.promotion ?? next.hotel?.promotion,
        originalPrice: selection?.originalPrice ?? next.hotel?.originalPrice,
        discountedPrice: selection?.discountedPrice ?? next.hotel?.discountedPrice,
        discountPercentage: selection?.discountPercentage ?? next.hotel?.discountPercentage,
        checkInDate: selection?.checkInDate ?? next.hotel?.checkInDate,
        checkOutDate: selection?.checkOutDate ?? next.hotel?.checkOutDate,
      };
      if (startDate && !Number.isNaN(startDate.getTime())) {
        next.startDate = startDate;
      }
      if (endDate && !Number.isNaN(endDate.getTime())) {
        next.endDate = endDate;
      }
      if (selection?.stayDates) {
        next.dates = selection.stayDates;
      }
      return next;
    });
    setView('bookings');
  };

  const handleSelectVehicle = (vehicle: any) => {
    if (!vehicle) return;
    if (!requireAuth()) return;
    setTripData((prev: any) => {
      const next = { ...(prev || {}) };
      const basePrice =
        typeof vehicle?.price === 'number'
          ? vehicle.price
          : typeof vehicle?.price_per_km === 'number'
            ? vehicle.price_per_km
            : Number(vehicle?.price ?? 0);
      const discountedPrice =
        typeof vehicle?.discounted_price === 'number'
          ? vehicle.discounted_price
          : Number(vehicle?.discounted_price ?? basePrice);
      const hasPromotion = Boolean(vehicle?.has_promotion ?? vehicle?.hasPromotion);
      const effectivePrice = hasPromotion && Number.isFinite(discountedPrice) ? discountedPrice : basePrice;
      const safeDiscountedPrice = hasPromotion && Number.isFinite(discountedPrice) ? discountedPrice : undefined;
      const transportId = vehicle?.transport_id ?? vehicle?.transportId ?? vehicle?.id ?? null;
      next.rental = {
        ...(next.rental || {}),
        name: vehicle?.name ?? next.rental?.name,
        features: vehicle?.type ?? next.rental?.features,
        image: vehicle?.image ?? next.rental?.image,
        owner: vehicle?.owner ?? next.rental?.owner,
        dailyPrice: effectivePrice ?? next.rental?.dailyPrice,
        price: Number.isFinite(effectivePrice) ? effectivePrice : next.rental?.price,
        isBooked: true,
        status: 'Pending',
        transport_id: transportId,
        transportId,
        // Promotion fields
        hasPromotion: hasPromotion ?? next.rental?.hasPromotion,
        promotion: vehicle?.promotion ?? next.rental?.promotion,
        originalPrice: vehicle?.original_price ?? basePrice ?? next.rental?.originalPrice,
        discountedPrice: safeDiscountedPrice ?? next.rental?.discountedPrice,
        originalDailyPrice: vehicle?.original_price ?? basePrice ?? next.rental?.originalDailyPrice,
        discountedDailyPrice: safeDiscountedPrice ?? next.rental?.discountedDailyPrice,
        discountPercentage: hasPromotion ? (vehicle?.discount_percentage ?? next.rental?.discountPercentage) : 0,
      };
      return next;
    });
    setView('trip-planner');
  };

  const customerBookingRoute =
    location.pathname === '/customer/book' || location.pathname === '/customer/bookings';
  const publicMapRoute = location.pathname === '/map';

  if (customerBookingRoute) {
    if (isGuest) {
      return (
        <Login
          onSwitchToRegister={() => setView('register')}
          onBack={() => setView('landing')}
          onSuccess={(nextView) => setView(nextView)}
        />
      );
    }

    if (user?.role !== 'customer') {
      return <VisitorHome />;
    }

    return location.pathname === '/customer/book' ? <BookTrip /> : <CustomerBookings />;
  }

  if (publicMapRoute) {
    return <MapPage />;
  }

  if (user?.role === 'admin') {
    return <AdminShell view={view} setView={setView} onLogout={logout} />;
  }

  if (user?.role === 'owner') {
    return <OwnerShell onLogout={logout} />;
  }

  switch (view) {
    case 'login':
      return (
        <Login
          onSwitchToRegister={() => setView('register')}
          onBack={() => setView('landing')}
          onSuccess={(nextView) => setView(nextView)}
        />
      );
    case 'register':
      return (
        <Register
          onSwitchToLogin={() => setView('login')}
          onBack={() => setView('landing')}
          onSuccess={(nextView) => setView(nextView)}
        />
      );
    case 'customer-book':
      if (isGuest) {
        return (
          <Login
            onSwitchToRegister={() => setView('register')}
            onBack={() => setView('landing')}
            onSuccess={(nextView) => setView(nextView)}
          />
        );
      }

      if (user?.role !== 'customer') {
        return <VisitorHome />;
      }

      return <BookTrip />;
    case 'customer-bookings':
      if (isGuest) {
        return (
          <Login
            onSwitchToRegister={() => setView('register')}
            onBack={() => setView('landing')}
            onSuccess={(nextView) => setView(nextView)}
          />
        );
      }

      if (user?.role !== 'customer') {
        return <VisitorHome />;
      }

      return <CustomerBookings />;
    case 'map':
      return <MapPage />;
    case 'profile':
      if (isGuest) {
        return (
          <div className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-28 pb-20">
            <div className="max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-[3rem] border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_55%)]" />
                <div className="relative p-8 sm:p-12">
                  <div className="inline-flex items-center rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    Profile
                  </div>
                  <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Login required to view your profile
                  </h1>
                  <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
                    Please login to update your personal information, notifications, and security settings.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setView('login')}
                      className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition-all"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setView('register')}
                      className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold transition-all"
                    >
                      Create account
                    </button>
                    <button
                      onClick={() => setView('landing')}
                      className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold transition-all"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <Profile
          initialTab={activeProfileTab}
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onNotificationClick={(notification) => {
            const conversationId = notification?.conversationId ?? notification?.data?.conversationId ?? null;
            if (String(notification?.type) === 'message' && conversationId) {
              sessionStorage.setItem(
                'pending_message_thread',
                JSON.stringify({
                  ownerId: conversationId,
                  ownerEmail: notification?.conversationEmail ?? notification?.data?.conversationEmail ?? '',
                  ownerName:
                    notification?.conversationName ??
                    notification?.data?.conversationName ??
                    (notification.title?.replace(/^New message from\s+/i, '') || 'Owner'),
                  ownerAvatar: notification?.conversationAvatar ?? notification?.data?.conversationAvatar ?? '',
                }),
              );
              setView('messages');
            }
          }}
        />
      );
    case 'hotels':
      return (
        <Hotels
          tripData={tripData}
          browseDestination={browseDestination}
          onBack={() => setView(hotelBackView || 'landing')}
          onSelectHotel={handleSelectHotel}
          setTripData={setTripData}
          onOpenMessages={() => setView('messages')}
        />
      );
    case 'hotel-details':
      return (
        <HotelDetails
          tripData={tripData}
          hotel={selectedHotel}
          onBack={() => setView('hotels')}
          onReserve={handleReserveHotel}
        />
      );
    case 'rentals':
      return <Rentals onBack={() => setView('trip-planner')} onSelectVehicle={handleSelectVehicle} />;
    case 'activities':
      return (
        <Activities
          onBack={() => setView('trip-planner')}
          onRequireLogin={() => setView('login')}
          onConfirmBooking={() => setView('bookings')}
          isAuthenticated={!isGuest}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
        />
      );
    case 'promotions':
      return (
        <Promotions
          onBack={() => setView('landing')}
          onClaim={(promotion: ClaimedPromotion) => {
            setTripData((prev) => ({
              ...prev,
              promotion
            }));
            setView('trip-planner');
          }}
        />
      );
    case 'trip-planner':
      return (
        <TripPlanner
          tripData={tripData}
          setTripData={setTripData}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          onBack={() => setView('landing')}
          onHotelClick={onHotelsClick}
          onExploreHotel={onHotelsClick}
          onRentalClick={onRentalsClick}
          onActivitiesClick={onActivitiesClick}
          onProceedToBooking={() => {
            if (!requireAuth()) return;
            setView('bookings');
          }}
        />
      );
    case 'group-planning':
      if (isGuest) {
        setView('login');
        return null;
      }
      return (
        <GroupPlanning
          onBack={() => setView('bookings')}
          tripTitle={tripData?.title}
        />
      );
    case 'bookings':
      if (isGuest) {
        return (
          <div className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-28 pb-20">
            <div className="max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-[3rem] border border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_55%)]" />

                <div className="relative p-8 sm:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                    <div className="flex-1">
                      <div className="inline-flex items-center rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                        Bookings
                      </div>
                      <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Login required to view your bookings
                      </h1>
                      <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl">
                        You can browse hotels, rentals, and activities as a guest, but to confirm and manage bookings you’ll need an account.
                      </p>

                      <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setView('login')}
                          className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition-all"
                        >
                          Login to continue
                        </button>
                        <button
                          onClick={() => setView('register')}
                          className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold transition-all"
                        >
                          Create account
                        </button>
                        <button
                          onClick={() => setView('landing')}
                          className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold transition-all"
                        >
                          Back to Home
                        </button>
                      </div>
                    </div>

                    <div className="w-full lg:w-[360px]">
                      <div className="rounded-[2.5rem] p-[1px] bg-gradient-to-br from-blue-600/40 via-slate-900/40 to-emerald-500/30">
                        <div className="rounded-[2.45rem] bg-slate-900 dark:bg-slate-950 p-7 border border-white/10">
                          <p className="text-xs font-bold text-slate-200">What you can do now</p>
                          <div className="mt-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <p className="text-sm text-slate-300">Browse hotels and view details</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <p className="text-sm text-slate-300">Explore rentals and activities</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <p className="text-sm text-slate-300">Booking & payment require login</p>
                            </div>
                          </div>

                          <div className="mt-6">
                            <button
                              onClick={() => setView('hotels')}
                              className="w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-100 font-bold transition-all"
                            >
                              Browse Hotels
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return (
        <BookingHistory
          onPaymentClick={() => {
            if (!requireAuth()) return;
            setView('payment');
          }}
          onHotelClick={onHotelsClick}
          onRentalClick={onRentalsClick}
          onGroupPlanningClick={() => {
            if (!requireAuth()) return;
            setView('group-planning');
          }}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          tripData={tripData}
          setTripData={setTripData}
        />
      );
    case 'group-invite':
      return <GroupInvite />;
    case 'payment':
      if (isGuest) return <VisitorHome />;
      return (
        <Payment
          tripData={tripData}
          selectedActivityIds={selectedActivityIds}
          onBackToHome={() => setView('landing')}
          onOpenMessages={() => setView('messages')}
        />
      );
    case 'messages':
      return <CustomerMessagesPage />;
    case 'customer-dashboard':
      return (
        <CustomerDashboard
          tripData={tripData}
          onSelectRecommendation={onSelectRecommendation}
          onSelectDestination={onSelectDestination}
          onSearchDestination={onSearchDestination}
          onPromotionsClick={onPromotionsClick}
          onHotelsClick={onHotelsClick}
          onRentalsClick={onRentalsClick}
          onActivitiesClick={onActivitiesClick}
          onOpenBookTrip={() => setView('customer-book')}
          onOpenMyBookings={() => setView('customer-bookings')}
          onStartGroupBooking={() => setView('group-planning')}
          onRequireLogin={() => setView('login')}
        />
      );
    case 'landing':
    default:
      return (
        <CustomerDashboard
          tripData={tripData}
          onSelectRecommendation={onSelectRecommendation}
          onSelectDestination={onSelectDestination}
          onSearchDestination={onSearchDestination}
          onPromotionsClick={onPromotionsClick}
          onHotelsClick={onHotelsClick}
          onRentalsClick={onRentalsClick}
          onActivitiesClick={onActivitiesClick}
          onOpenBookTrip={() => setView('customer-book')}
          onOpenMyBookings={() => setView('customer-bookings')}
          onStartGroupBooking={() => setView('group-planning')}
          onRequireLogin={() => setView('login')}
        />
      );
  }
};
