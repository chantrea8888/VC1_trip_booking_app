import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/utils';
import { bookingService } from '@/src/services/bookingService';
import { useAuth } from '../../context/AuthContext';

const Bookings = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  
  const [serviceFilter, setServiceFilter] = React.useState<'all' | 'hotel' | 'transport'>('all');
  const [dateRange, setDateRange] = React.useState<'last1' | 'last3' | 'last7' | 'all'>('last7');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [bookings, setBookings] = React.useState([]);
  const [stats, setStats] = React.useState({
    totalBookings: '1,240',
    activeGuests: '42',
    pendingPayments: '$1,450'
  });
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [exportLoading, setExportLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [authChecking, setAuthChecking] = React.useState(true);
  
  // Filter modal state
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [tempFilters, setTempFilters] = React.useState({
    status: 'all' as 'all' | 'paid' | 'pending' | 'canceled',
    minAmount: '',
    maxAmount: '',
    guestName: '',
    bookingId: ''
  });
  const [activeFilters, setActiveFilters] = React.useState({
    status: 'all' as 'all' | 'paid' | 'pending' | 'canceled',
    minAmount: '',
    maxAmount: '',
    guestName: '',
    bookingId: ''
  });
  
  const pageSize = 10;

  // Debug localStorage on mount
  React.useEffect(() => {
    console.log('🔍 ===== DEBUG INFO =====');
    console.log('Auth Context - isAuthenticated:', isAuthenticated);
    console.log('Auth Context - user:', user);
    console.log('Auth Context - token exists:', !!token);
    console.log('localStorage - auth_token:', localStorage.getItem('auth_token'));
    console.log('localStorage - user:', localStorage.getItem('user'));
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        console.log('Parsed user from storage:', parsedUser);
        console.log('User role from storage:', parsedUser.role);
      }
    } catch (e) {
      console.error('Error parsing user from storage:', e);
    }
    console.log('🔍 =====================');
  }, []);

  // Check if user is owner
  React.useEffect(() => {
    const checkAccess = async () => {
      setAuthChecking(true);
      setAuthError(null);
      
      // First check if authenticated
      if (!isAuthenticated || !token) {
        console.log('❌ Not authenticated');
        setAuthError('Please log in to access this page');
        setTimeout(() => navigate('/login'), 3000);
        setAuthChecking(false);
        return;
      }

      try {
        // Verify with backend
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend user verification:', data);
          
          const userRole = data.user?.role || data.role;
          const nextView = data.next_view;
          
          // Check if user is owner
          if (userRole === 'owner' || userRole === 'admin' || nextView === 'owner-dashboard') {
            console.log('✅ Access granted - User is owner');
          } else {
            console.log('❌ Access denied - User is not owner');
            setAuthError('You do not have permission to access this page');
            setTimeout(() => navigate('/dashboard'), 3000);
          }
        } else {
          console.log('❌ Backend verification failed');
          setAuthError('Session expired. Please log in again.');
          logout();
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('❌ Error verifying user:', error);
        setAuthError('Authentication error');
      } finally {
        setAuthChecking(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, token, navigate, logout]);

  // Test API connection
  React.useEffect(() => {
    if (!isAuthenticated) return;
    
    const testAPI = async () => {
      try {
        console.log('🧪 ===== TESTING API CONNECTION =====');
        console.log(`🧪 Fetching from: ${API_BASE_URL}/bookings`);
        
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
          },
        });
        
        console.log('🧪 Response status:', response.status);
        
        const data = await response.json();
        console.log('🧪 API Response Data:', data);
        
        if (data.data && data.data.length > 0) {
          console.log(`✅ SUCCESS: Found ${data.data.length} bookings in database`);
        } else {
          console.log('❌ No bookings found in database');
        }
      } catch (error) {
        console.error('❌ API TEST FAILED:', error);
      }
    };
    
    testAPI();
  }, [isAuthenticated, token]);

  // Auto-hide messages
  React.useEffect(() => {
    if (pageError || successMessage) {
      const timer = setTimeout(() => {
        setPageError(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pageError, successMessage]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const addDays = (base: Date, deltaDays: number) => {
    const next = new Date(base);
    next.setDate(next.getDate() + deltaDays);
    return next;
  };

  const now = new Date();

  // Mock data as fallback
  const mockCustomerBookings = [
    { 
      id: 'BK-1001', 
      guest: 'Sophia Martinez', 
      service: 'Angkor Paradise Hotel', 
      route: 'Siem Reap - City Center', 
      dateStart: formatDate(addDays(now, 2)), 
      dateEnd: formatDate(addDays(now, 5)), 
      pax: 2, 
      amount: 450.00, 
      status: 'paid', 
      category: 'hotel',
      roomType: 'Deluxe Double',
      customerEmail: 'sophia.m@email.com',
    },
    { 
      id: 'BK-1002', 
      guest: 'James Johnson', 
      service: 'The Bale Phnom Penh', 
      route: 'Phnom Penh - Riverside', 
      dateStart: formatDate(addDays(now, 1)), 
      dateEnd: formatDate(addDays(now, 3)), 
      pax: 1, 
      amount: 320.50, 
      status: 'pending', 
      category: 'hotel',
      roomType: 'Executive Suite',
      customerEmail: 'james.j@email.com',
    },
    { 
      id: 'TB-2001', 
      guest: 'Michael Brown', 
      service: 'Private SUV - Toyota Camry', 
      route: 'Phnom Penh → Siem Reap', 
      date: formatDate(addDays(now, 1)), 
      time: '08:00 AM', 
      pax: 3, 
      amount: 180.00, 
      status: 'paid', 
      category: 'transport',
      vehicleType: 'SUV - 4 seats',
      customerEmail: 'michael.b@email.com',
    },
  ];

  // Fetch bookings from backend
  const fetchBookings = React.useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setPageError(null);
      const filters = {
        service: serviceFilter !== 'all' ? serviceFilter : undefined,
        date_range: dateRange,
        search: searchTerm || undefined,
        status: activeFilters.status !== 'all' ? activeFilters.status : undefined,
        min_amount: activeFilters.minAmount || undefined,
        max_amount: activeFilters.maxAmount || undefined,
        guest_name: activeFilters.guestName || undefined,
        booking_id: activeFilters.bookingId || undefined
      };
      
      console.log('📡 FetchBookings - Calling API with filters:', filters);
      
      const response = await bookingService.getBookings(filters);
      
      console.log('📡 FetchBookings - Response:', response);
      
      if (response.data && response.data.length > 0) {
        console.log(`✅ FetchBookings - Got ${response.data.length} REAL bookings from API`);
        setBookings(response.data);
      } else {
        console.log('⚠️ FetchBookings - No real data, using mock data');
        setBookings(mockCustomerBookings);
      }
    } catch (error) {
      console.error('❌ FetchBookings - Error:', error);
      setPageError('Failed to load bookings. Showing sample data.');
      setBookings(mockCustomerBookings);
    } finally {
      setLoading(false);
    }
  }, [serviceFilter, dateRange, searchTerm, activeFilters, isAuthenticated]);

  // Fetch booking statistics
  const fetchStats = React.useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('📊 FetchStats - Getting booking stats');
      const response = await bookingService.getBookingStats();
      console.log('📊 FetchStats - Response:', response);
      
      setStats({
        totalBookings: response.total_bookings || '1,240',
        activeGuests: response.active_guests || '42',
        pendingPayments: response.pending_payments || '$1,450'
      });
    } catch (error) {
      console.error('❌ FetchStats - Error:', error);
    }
  }, [isAuthenticated]);

  // Initial data fetch
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Initial data fetch triggered');
      fetchBookings();
      fetchStats();
    }
  }, [isAuthenticated, fetchBookings, fetchStats]);

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Filters changed, resetting to page 1');
      setCurrentPage(1);
    }
  }, [serviceFilter, dateRange, searchTerm, activeFilters, isAuthenticated]);

  const parseBookingDate = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isWithinSelectedRange = (value: string) => {
    if (dateRange === 'all') return true;
    const d = parseBookingDate(value);
    if (!d) return true;

    const now = new Date();
    const days = dateRange === 'last7' ? 7 : dateRange === 'last3' ? 3 : 1;
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - days);
    return d >= cutoff;
  };

  // Filter bookings based on ALL filters
  const filteredBookings = bookings
    .filter((b: any) => (serviceFilter === 'all' ? true : b.category === serviceFilter))
    .filter((b: any) => {
      // Prefer createdAt for date-range filtering (booking dates may be non-ISO / missing year)
      const dateToCheck = b.createdAt ?? b.created_at ?? (b.category === 'hotel' ? b.dateStart : b.date);
      return isWithinSelectedRange(dateToCheck);
    })
    .filter((b: any) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        String(b.id ?? '').toLowerCase().includes(term) ||
        String(b.guest ?? '').toLowerCase().includes(term) ||
        String(b.service ?? '').toLowerCase().includes(term) ||
        String(b.route ?? '').toLowerCase().includes(term)
      );
    })
    .filter((b: any) => {
      if (activeFilters.status !== 'all' && b.status !== activeFilters.status) {
        return false;
      }
      if (
        activeFilters.guestName &&
        !String(b.guest ?? '').toLowerCase().includes(activeFilters.guestName.toLowerCase())
      ) {
        return false;
      }
      if (activeFilters.bookingId && !String(b.id ?? '').toLowerCase().includes(activeFilters.bookingId.toLowerCase())) {
        return false;
      }
      if (activeFilters.minAmount && Number(b.amount ?? 0) < parseFloat(activeFilters.minAmount)) {
        return false;
      }
      if (activeFilters.maxAmount && Number(b.amount ?? 0) > parseFloat(activeFilters.maxAmount)) {
        return false;
      }
      return true;
    });

  console.log('📊 Current filteredBookings count:', filteredBookings.length);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  const getPageItems = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const items: Array<number | '...'> = [];
    const add = (v: number | '...') => items.push(v);

    add(1);

    const left = Math.max(2, safeCurrentPage - 1);
    const right = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (left > 2) add('...');
    for (let p = left; p <= right; p++) add(p);
    if (right < totalPages - 1) add('...');

    add(totalPages);
    return items;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openFilterModal = () => {
    setTempFilters({ ...activeFilters });
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    setActiveFilters({ ...tempFilters });
    setShowFilterModal(false);
    setCurrentPage(1);
    setSuccessMessage('Filters applied successfully');
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: 'all' as const,
      minAmount: '',
      maxAmount: '',
      guestName: '',
      bookingId: ''
    };
    setTempFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setShowFilterModal(false);
    setCurrentPage(1);
    setSuccessMessage('Filters cleared');
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setPageError(null);
      
      const headers = ['Booking ID', 'Guest Name', 'Service', 'Route', 'Date', 'Pax', 'Amount', 'Status', 'Email'];
      const csvData = filteredBookings.map((b: any) => [
        b.id,
        b.guest,
        b.service,
        b.route,
        b.category === 'hotel' ? `${b.dateStart} to ${b.dateEnd}` : `${b.date} ${b.time}`,
        b.pax,
        `$${b.amount}`,
        b.status,
        b.customerEmail || '',
      ]);
      
      const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      setPageError('Failed to export bookings');
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewBookingDetails = (booking: any) => {
    navigate(`/bookings/${booking.id}`, { state: { booking } });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle2 size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'canceled': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600";
      case 'pending': return "bg-amber-50 dark:bg-amber-900/20 text-amber-600";
      case 'canceled': return "bg-rose-50 dark:bg-rose-900/20 text-rose-600";
      default: return "bg-slate-50 dark:bg-slate-900/20 text-slate-600";
    }
  };

  const formatMoney = (value: any) => {
    const n = Number(value);
    if (Number.isFinite(n)) return n.toFixed(2);
    return '0.00';
  };

  const activeFilterCount = Object.values(activeFilters).filter(val => val !== 'all' && val !== '').length;

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error if not authenticated or not owner
  if (!isAuthenticated || authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl max-w-md text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>{authError || 'Please log in to access this page'}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Top Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all" 
            placeholder="Search businesses, owners, or destinations..." 
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Message Notifications */}
      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{pageError}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'TOTAL BOOKINGS', value: stats.totalBookings, icon: Calendar, color: 'blue' },
          { label: 'ACTIVE GUESTS', value: stats.activeGuests, icon: Users, color: 'emerald' },
          { label: 'PENDING PAYMENTS', value: stats.pendingPayments, icon: CreditCard, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
              )}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Bookings Table Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 rounded-xl text-sm transition-all" 
              placeholder="Search Booking ID, Guest Name..." 
              type="text"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            {/* Service Filter Tabs */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setServiceFilter('all')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  serviceFilter === 'all'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                All Services
              </button>
              <button
                onClick={() => setServiceFilter('hotel')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  serviceFilter === 'hotel'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                Hotel
              </button>
              <button
                onClick={() => setServiceFilter('transport')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  serviceFilter === 'transport'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                Transport
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="appearance-none pl-10 pr-10 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <option value="last1" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 1 Day</option>
                <option value="last3" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 3 Days</option>
                <option value="last7" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 7 Days</option>
                <option value="all" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">All time</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={openFilterModal}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors relative",
                  activeFilterCount > 0 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                <Filter size={16} /> 
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={handleExport}
                disabled={exportLoading}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} /> 
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeFilterModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Advanced Filters</h3>
                <button onClick={closeFilterModal} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Booking Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['all', 'paid', 'pending', 'canceled'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setTempFilters({ ...tempFilters, status })}
                        className={cn(
                          "px-3 py-2 text-xs font-bold rounded-lg capitalize transition-colors",
                          tempFilters.status === status
                            ? status === 'all' ? "bg-blue-600 text-white" :
                              status === 'paid' ? "bg-emerald-600 text-white" :
                              status === 'pending' ? "bg-amber-600 text-white" :
                              "bg-rose-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking ID Filter */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    value={tempFilters.bookingId}
                    onChange={(e) => setTempFilters({ ...tempFilters, bookingId: e.target.value })}
                    placeholder="e.g., BK-1001"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                {/* Guest Name Filter */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={tempFilters.guestName}
                    onChange={(e) => setTempFilters({ ...tempFilters, guestName: e.target.value })}
                    placeholder="Enter guest name"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                {/* Amount Range Filter */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Amount Range ($)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={tempFilters.minAmount}
                      onChange={(e) => setTempFilters({ ...tempFilters, minAmount: e.target.value })}
                      placeholder="Min"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                    <input
                      type="number"
                      value={tempFilters.maxAmount}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxAmount: e.target.value })}
                      placeholder="Max"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <th className="px-6 py-4">BOOKING ID</th>
                    <th className="px-6 py-4">GUEST NAME</th>
                    <th className="px-6 py-4">SERVICE & ROUTE</th>
                    <th className="px-6 py-4">DATE & TIME</th>
                    <th className="px-6 py-4">PAX</th>
                    <th className="px-6 py-4">AMOUNT</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking: any) => (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => handleViewBookingDetails(booking)}
                      >
                        <td className="px-6 py-4 font-bold text-sm text-blue-600">{booking.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-sm">{booking.guest}</p>
                            <p className="text-[10px] text-slate-400">{booking.customerEmail || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{booking.service}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{booking.route}</p>
                          {booking.roomType && (
                            <p className="text-[10px] text-slate-400">{booking.roomType}</p>
                          )}
                          {booking.vehicleType && (
                            <p className="text-[10px] text-slate-400">{booking.vehicleType}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {booking.category === 'hotel' ? (
                            <>
                              <p className="text-sm font-medium">{booking.dateStart}</p>
                              <p className="text-[10px] text-slate-400 font-bold">to {booking.dateEnd}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium">{booking.date}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{booking.time}</p>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">{booking.pax}</td>
                        <td className="px-6 py-4 text-sm font-bold">${formatMoney(booking.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full",
                            getStatusColor(booking.status)
                          )}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBookingDetails(booking);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                Showing {filteredBookings.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, filteredBookings.length)} of {filteredBookings.length} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                  {getPageItems().map((page, i) =>
                    page === '...' ? (
                      <span key={`dots-${i}`} className="w-8 h-8 inline-flex items-center justify-center text-xs font-bold text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                          page === safeCurrentPage
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        aria-label={`Page ${page}`}
                        aria-current={page === safeCurrentPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Bookings;
