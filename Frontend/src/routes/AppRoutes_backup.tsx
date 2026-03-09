import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Dashboard as CustomerDashboard } from '../pages/customer/Dashboard';
import { Destinations } from '../pages/customer/Destinations';
import { TripPlanner } from '../pages/customer/TripPlanner';
import { BookingHistory } from '../pages/customer/BookingHistory';
import { GroupInvite } from '../pages/customer/GroupInvite';
import { GroupPlanning } from '../pages/customer/GroupPlanning';
import { Payment } from '../pages/customer/Payment';
import OwnerDashboard from '../pages/owner/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Profile } from '../pages/customer/Profile';
import { HotelDetails, type HotelReservationSelection } from '../pages/customer/HotelDetails';
import { Rentals } from '../pages/customer/Rentals';
import { Activities } from '../pages/customer/Activities';
import { Promotions } from '../pages/customer/Promotions';
import { ALL_HOTELS } from '../data/hotels';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { AdminNotification } from '../components/common/NotificationDropdown';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import VisitorHome from '../pages/public/VisitorHome';
import CustomerDashboard from '../pages/customer/Dashboard';
import Destinations from '../pages/customer/Destinations';
import TripPlanner from '../pages/customer/TripPlanner';
import BookingHistory from '../pages/customer/BookingHistory';
import GroupInvite from '../pages/customer/GroupInvite';
import Payment from '../pages/customer/Payment';
import OwnerDashboard from '../pages/owner/Dashboard';
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
} from '../pages/admin';

interface AppRoutesProps {
  view: string;
  setView: (view: string) => void;
  onSelectRecommendation: (item: any) => void;
  onSelectDestination: (dest: any) => void;
  onPromotionsClick: () => void;
  onHotelsClick: () => void;
  onRentalsClick: () => void;
  onActivitiesClick: () => void;
  notifications: any[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  activeProfileTab: any;
  selectedHotel: any | null;
  setSelectedHotel: (hotel: any | null) => void;
  selectedActivityIds: number[];
  setSelectedActivityIds: (ids: number[]) => void;
  tripData: any;
  setTripData: (data: any) => void;
  onSearch?: (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => void;
  returnToPlanner?: boolean;
  setReturnToPlanner?: (val: boolean) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ 
  view, 
  setView, 
  onSelectRecommendation, 
  onSelectDestination,
  onPromotionsClick,
  onHotelsClick,
  onRentalsClick,
  onActivitiesClick,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  activeProfileTab,
  selectedHotel,
  setSelectedHotel,
  selectedActivityIds,
  setSelectedActivityIds,
  tripData,
  setTripData,
  onSearch,
  returnToPlanner,
  setReturnToPlanner
}) => {
  const { user } = useAuth();

  // Simple routing based on view state
  switch (view) {
    case 'login':
      return (
        <Login 
          onSwitchToRegister={() => setView('register')} 
          onBack={() => setView('landing')} 
          onSuccess={() => setView('landing')}
        />
      );
    
    case 'register':
      return (
        <Register 
          onSwitchToLogin={() => setView('login')} 
          onBack={() => setView('landing')} 
          onSuccess={() => setView('landing')}
        />
      );
    
    case 'landing':
    case 'hotels':
    case 'destinations':
    case 'hotel-details':
    case 'rentals':
    case 'activities':
    case 'promotions':
    case 'trip-planner':
    case 'group-planning':
    case 'bookings':
    case 'group-invite':
    case 'payment':
    case 'owner-dashboard':
    case 'customer-dashboard':
      return <VisitorHome currentView={view} />;
    
    default:
      return <VisitorHome currentView="landing" />;
  }
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

export const AppRoutes: React.FC<AppRoutesProps> = ({ view, setView }) => {
  const { user, logout } = useAuth();

  if (user?.role === 'admin') {
    return <AdminShell view={view} setView={setView} onLogout={logout} />;
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
          onSuccess={() => setView('landing')}
        />
      );
    case 'hotels':
      return (
        <Destinations 
          tripData={tripData}
          onBack={() => setView(returnToPlanner ? 'trip-planner' : 'landing')} 
          onSelectHotel={(hotel) => {
            setSelectedHotel({ ...hotel, backView: 'hotels' });
            setView('hotel-details');
          }}
        />
      );
    case 'hotel-details':
      return (
        <HotelDetails 
          tripData={tripData}
          hotel={selectedHotel} 
          onBack={() => setView(selectedHotel?.backView || (returnToPlanner ? 'trip-planner' : 'hotels'))} 
          onReserve={(selection: HotelReservationSelection) => {
            const priceStr = String(selectedHotel?.price || '0');
            const fallbackDailyPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
            const dailyPrice = selection?.nightlyPrice || fallbackDailyPrice;
            
            setTripData((prev: any) => {
              let nights = 7; // Default
              if (prev.startDate && prev.endDate) {
                const start = new Date(prev.startDate);
                const end = new Date(prev.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0) nights = diffDays;
              }

              const locationParts = String(selectedHotel?.location || '')
                .split(',')
                .map((part: string) => part.trim())
                .filter(Boolean);
              const destinationName =
                locationParts.length > 1
                  ? locationParts[locationParts.length - 2]
                  : locationParts[0] || prev.destination?.name || 'Siem Reap';
              const destinationCountry =
                locationParts[locationParts.length - 1] || prev.destination?.country || 'Cambodia';
              const selectedGuests = Math.max(1, Number(selection?.guests || 2));
              const guestsLabel = `${selectedGuests} ${selectedGuests === 1 ? 'Guest' : 'Guests'}`;

              return {
                ...prev,
                guests: guestsLabel,
                destination: {
                  ...prev.destination,
                  name: destinationName,
                  country: destinationCountry,
                  image: selectedHotel?.image || prev.destination?.image
                },
                hotel: {
                  ...prev.hotel,
                  name: selectedHotel?.name || prev.hotel?.name,
                  location: selectedHotel?.location || prev.hotel?.location,
                  price: dailyPrice * nights,
                  dailyPrice: dailyPrice,
                  nights: nights,
                  roomType: selection?.roomType || prev.hotel?.roomType || 'Deluxe Room',
                  roomCategory: selection?.roomCategory || prev.hotel?.roomCategory || 'Room',
                  guests: guestsLabel,
                  maxOccupancy: selection?.maxOccupancy || prev.hotel?.maxOccupancy || selectedGuests,
                  cleaningFee: selection?.cleaningFee || prev.hotel?.cleaningFee || 0,
                  serviceFee: selection?.serviceFee || prev.hotel?.serviceFee || 0,
                  estimatedTotal: selection?.totalPrice || (dailyPrice * nights),
                  image: selectedHotel?.image || (selectedHotel?.images && selectedHotel.images[0]) || prev.hotel.image,
                  status: "Reserved"
                }
              };
            });
            
            if (returnToPlanner) {
              setView('trip-planner');
            } else {
              setView('bookings');
            }
          }}
        />
      );
    case 'rentals':
      return (
        <Rentals 
          onBack={() => setView(returnToPlanner ? 'trip-planner' : 'landing')} 
          onSelectVehicle={(vehicle) => {
            setTripData((prev: any) => {
              let days = 7; // Default
              if (prev.startDate && prev.endDate) {
                const start = new Date(prev.startDate);
                const end = new Date(prev.endDate);
                
                // Use a more robust calculation for days
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 0) {
                  days = diffDays;
                } else if (diffDays === 0) {
                  days = 1; // Minimum 1 day
                }
              }

              return {
                ...prev,
                rental: {
                  ...prev.rental,
                  name: vehicle.name,
                  price: vehicle.price * days,
                  dailyPrice: vehicle.price,
                  days: days,
                  image: vehicle.image,
                  features: `${vehicle.transmission || 'Auto'} • ${vehicle.type}`,
                  isBooked: true
                }
              };
            });
            
            if (returnToPlanner) {
              setView('trip-planner');
            } else {
              setView('bookings');
            }
          }}
        />
      );
    case 'activities':
      return (
        <Activities onBack={() => setView(returnToPlanner ? 'trip-planner' : 'landing')} />
      );
    case 'promotions':
      return (
        <Promotions 
          onBack={() => setView('landing')} 
          onClaim={() => setView('bookings')}
        />
      );
    case 'trip-planner':
      return (
        <TripPlanner 
          tripData={tripData}
          setTripData={setTripData}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          onBack={() => { setReturnToPlanner?.(false); setView('landing'); }}
          onHotelClick={() => { setReturnToPlanner?.(true); setView('hotels'); }}
          onExploreHotel={() => {
            const hotel = ALL_HOTELS.find((h: any) => h.name === tripData.hotel.name);
            if (hotel) {
              setSelectedHotel({ ...hotel, backView: 'trip-planner' });
              setReturnToPlanner?.(true);
              setView('hotel-details');
            }
          }}
          onRentalClick={() => { setReturnToPlanner?.(true); setView('rentals'); }}
          onActivitiesClick={() => { setReturnToPlanner?.(true); setView('activities'); }}
          onProceedToBooking={() => setView('payment')}
        />
      );
    case 'bookings':
      return (
        <BookingHistory 
          onPaymentClick={() => setView('payment')} 
          onHotelClick={() => {
            setView('hotels');
          }}
          onRentalClick={() => setView('rentals')}
          onGroupPlanningClick={() => setView('group-planning')}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          tripData={tripData}
          setTripData={setTripData}
        />
      );
    case 'group-invite':
      return <GroupInvite />;
    case 'group-planning':
      return (
        <GroupPlanning 
          onBack={() => setView('bookings')} 
          tripTitle={tripData.title}
        />
      );
    case 'payment':
      return (
        <Payment 
          tripData={tripData} 
          onBackToHome={() => setView('landing')} 
          selectedActivityIds={selectedActivityIds}
        />
      );
    case 'profile':
      return (
        <Profile 
          initialTab={activeProfileTab} 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead}
        />
      );
    case 'owner-dashboard':
      return <OwnerDashboard />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'landing':
    default:
      return <VisitorHome />;
  }
};
