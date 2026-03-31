import React from 'react';
import {
  Search, 
  Download, 
  FileText,
  Bell,
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
  SlidersHorizontal,
  RotateCcw,
  DollarSign,
  X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { ALL_HOTELS } from '../../data/hotels';
import { RENTAL_VEHICLES } from '../../data/rentals';

const Bookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated, logout } = useAuth();
  
  const [serviceFilter, setServiceFilter] = React.useState<'all' | 'hotel' | 'transport'>('all');
  const [dateRange, setDateRange] = React.useState<'last1' | 'last3' | 'last7' | 'all'>('last7');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    totalBookings: '1,240',
    activeGuests: '42',
    pendingPayments: '$1,450'
  });
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [exportLoading, setExportLoading] = React.useState(false);
  const [exportPdfLoading, setExportPdfLoading] = React.useState(false);
  const [showPdfModal, setShowPdfModal] = React.useState(false);
  const [pdfOptions, setPdfOptions] = React.useState(() => ({
    title: 'Bookings Export',
    subtitle: 'Cambodia Travel',
    theme: 'clean' as 'clean' | 'dark',
    includeHeaderBand: true,
    includeRowStripes: true,
    accentHex: '#2563eb',
    pageBgHex: '#ffffff',
    filename: `bookings-${new Date().toISOString().split('T')[0]}.pdf`,
  }));
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [focusBookingId, setFocusBookingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const id = params.get('booking_id');
    setFocusBookingId(id ? String(id) : null);
  }, [location.search]);

  type OwnerNotification = {
    id: number | string;
    title: string;
    message?: string | null;
    bookingId?: string | null;
    data?: any;
    readAt?: string | null;
    createdAt?: string | null;
  };

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState<OwnerNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = React.useState(0);

  const BOOKINGS_CACHE_KEY = 'owner_bookings_cache_v1';
  const STATS_CACHE_KEY = 'owner_booking_stats_cache_v1';

  // Load cached data immediately for faster refresh UX
  React.useEffect(() => {
    try {
      const cachedBookings = localStorage.getItem(BOOKINGS_CACHE_KEY);
      if (cachedBookings) {
        const parsed = JSON.parse(cachedBookings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookings(parsed);
          setLoading(false);
        }
      }

      const cachedStats = localStorage.getItem(STATS_CACHE_KEY);
      if (cachedStats) {
        const parsed = JSON.parse(cachedStats);
        if (parsed && typeof parsed === 'object') {
          setStats((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore cache errors
    }
  }, []);
  
  type OwnerFilters = {
    status: 'all' | 'paid' | 'pending' | 'canceled';
    minAmount: string;
    maxAmount: string;
  };

  const defaultFilters: OwnerFilters = {
    status: 'all',
    minAmount: '',
    maxAmount: '',
  };

  const [filters, setFilters] = React.useState<OwnerFilters>(defaultFilters);

  const handleFilterChange = <K extends keyof OwnerFilters>(key: K, value: OwnerFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };



  const [openActionBookingId, setOpenActionBookingId] = React.useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = React.useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [updatingBookingId, setUpdatingBookingId] = React.useState<string | null>(null);
  const receiptRef = React.useRef<HTMLDivElement>(null);
  
  const pageSize = 10;

  // Debug auth state on mount
  React.useEffect(() => {
    console.log('🔍 ===== DEBUG INFO =====');
    console.log('Auth Context - isAuthenticated:', isAuthenticated);
    console.log('Auth Context - user:', user);
    console.log('Auth Context - token exists:', !!token);
    console.log('🔍 =====================');
  }, []);

  // Check if user is owner
  React.useEffect(() => {
    const checkAccess = async () => {
      setAuthError(null);
      
      // First check if authenticated
      if (!isAuthenticated || !token) {
        console.log('❌ Not authenticated');
        setAuthError('Please log in to access this page');
        setTimeout(() => navigate('/login'), 3000);
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
        setAuthError(null);
        setPageError('Backend not reachable. Showing cached data (if available).');
      }
    };

    checkAccess();
  }, [isAuthenticated, token, navigate, logout]);

  // Test API connection
  React.useEffect(() => {
    return;
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

  const formatNotificationTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      const apiFilters = {
        // Keep transport tab flexible (may include categories like 'trip'); fetch all and filter client-side.
        service: serviceFilter !== 'all' && serviceFilter !== 'transport' ? serviceFilter : undefined,
        date_range: dateRange,
        search: searchTerm || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        min_amount: filters.minAmount || undefined,
        max_amount: filters.maxAmount || undefined,
        booking_id: focusBookingId || undefined,
      };
      
      console.log('📡 FetchBookings - Calling API with filters:', apiFilters);
      
      const response = await bookingService.getBookings(apiFilters);
      
      console.log('📡 FetchBookings - Response:', response);
      
      const next = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ FetchBookings - Got ${next.length} bookings from API`);
      setBookings(next);

      if (focusBookingId) {
        const match = next.find((b: any) => String(b?.id ?? '') === String(focusBookingId));
        if (match) {
          openBookingDetails(match);
        }
      }
      try {
        localStorage.setItem(BOOKINGS_CACHE_KEY, JSON.stringify(next));
      } catch {
        // ignore cache write errors
      }
    } catch (error) {
      console.error('❌ FetchBookings - Error:', error);
      setPageError('Failed to load bookings. Showing cached data (if available).');
    } finally {
      setLoading(false);
    }
  }, [serviceFilter, dateRange, searchTerm, filters, isAuthenticated, focusBookingId]);

  // Fetch booking statistics
  const fetchStats = React.useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('📊 FetchStats - Getting booking stats');
      const response = await bookingService.getBookingStats();
      console.log('📊 FetchStats - Response:', response);
      
      const nextStats = {
        totalBookings: response.total_bookings || '1,240',
        activeGuests: response.active_guests || '42',
        pendingPayments: response.pending_payments || '$1,450'
      };

      setStats(nextStats);
      try {
        localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(nextStats));
      } catch {
        // ignore cache write errors
      }
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

  const fetchOwnerNotifications = React.useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated) return;

      try {
        if (!silent) setNotificationsLoading(true);
        const response = await bookingService.getOwnerNotifications({ limit: 25 });
        const next = Array.isArray(response?.data) ? response.data : [];
        const nextUnread = Number(
          response?.unread_count ?? response?.unreadCount ?? next.filter((n: any) => !n?.readAt).length,
        );

        setNotifications(next);
        setUnreadNotificationCount(Number.isFinite(nextUnread) ? nextUnread : 0);
      } catch (error) {
        console.error('Failed to fetch owner notifications:', error);
      } finally {
        if (!silent) setNotificationsLoading(false);
      }
    },
    [isAuthenticated],
  );

  React.useEffect(() => {
    if (!isAuthenticated) return;

    fetchOwnerNotifications();
    const id = window.setInterval(() => fetchOwnerNotifications({ silent: true }), 30000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, fetchOwnerNotifications]);

  React.useEffect(() => {
    if (showNotifications) {
      fetchOwnerNotifications();
    }
  }, [showNotifications, fetchOwnerNotifications]);

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Filters changed, resetting to page 1');
      setCurrentPage(1);
    }
  }, [serviceFilter, dateRange, searchTerm, filters, isAuthenticated]);

  const parseBookingDate = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const parseDateOnlyLocal = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const text = String(value).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const date = new Date(y, mo - 1, d);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateTime = (value: any) => {
    const d = parseBookingDate(value);
    if (!d) return value ? String(value) : '-';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (value: any) => {
    const d = parseDateOnlyLocal(value);
    if (!d) return value ? String(value) : '-';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatStay = (booking: any) => {
    const start = booking?.dateStart ?? booking?.date_start;
    const end = booking?.dateEnd ?? booking?.date_end;
    if (start && end) return `${formatDateOnly(start)} → ${formatDateOnly(end)}`;
    if (start) return formatDateOnly(start);
    return '-';
  };

  const downloadReceiptPdf = async () => {
    if (!receiptRef.current || !selectedBooking) return;

    try {
      const loadLib = async (name: string) => {
        const importer = Function('n', 'return import(n)') as (n: string) => Promise<any>;
        return importer(name);
      };

      const [html2canvasMod, jsPDFMod] = await Promise.all([loadLib('html2canvas'), loadLib('jspdf')]);
      const html2canvas = html2canvasMod?.default;
      const jsPDF = jsPDFMod?.default;
      if (!html2canvas || !jsPDF) throw new Error('Missing PDF dependencies');

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-${String(selectedBooking.id ?? 'booking')}.pdf`);
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      window.print();
    }
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

  const amountRangeInvalid = (() => {
    if (!filters.minAmount || !filters.maxAmount) return false;
    const min = parseFloat(filters.minAmount);
    const max = parseFloat(filters.maxAmount);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
    return min > max;
  })();

  // Filter bookings based on ALL filters
  const filteredBookings = bookings
    .filter((b: any) => {
      if (serviceFilter === 'all') return true;
      const category = String(b?.category ?? '').toLowerCase();
      if (serviceFilter === 'hotel') return category === 'hotel';
      // Transport tab should include other non-hotel categories used elsewhere in the app (e.g. 'trip').
      return category === 'transport' || category === 'trip' || category === 'rental';
    })
    .filter((b: any) => {
      // Prefer createdAt for date-range filtering (booking dates may be non-ISO / missing year)
      const dateToCheck = b.createdAt ?? b.created_at ?? b.date ?? (b.category === 'hotel' ? b.dateStart : null);
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
      if (filters.status !== 'all' && b.status !== filters.status) {
        return false;
      }
      if (amountRangeInvalid) return true;
      if (filters.minAmount && Number(b.amount ?? 0) < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && Number(b.amount ?? 0) > parseFloat(filters.maxAmount)) {
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
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchTerm('');
    setServiceFilter('all');
    setDateRange('last7');
    setCurrentPage(1);
    setSuccessMessage('All filters cleared');
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
        b.date
          ? `${b.date}${b.time ? ` ${b.time}` : ''}`
          : b.category === 'hotel'
            ? `${b.dateStart} to ${b.dateEnd}`
            : `${b.date} ${b.time}`,
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

  const handleExportPdf = async (options?: {
    title?: string;
    subtitle?: string;
    theme?: 'clean' | 'dark';
    includeHeaderBand?: boolean;
    includeRowStripes?: boolean;
    accentHex?: string;
    pageBgHex?: string;
    filename?: string;
  }) => {
    try {
      setExportPdfLoading(true);
      setPageError(null);

      if (!filteredBookings || filteredBookings.length === 0) {
        throw new Error('No bookings to export');
      }

      // Use a literal dynamic import so Vite can bundle it (variable imports won't be resolved).
      const jsPDFMod = await import('jspdf');
      const jsPDF =
        jsPDFMod?.jsPDF ||
        jsPDFMod?.default?.jsPDF ||
        jsPDFMod?.default ||
        jsPDFMod;
      if (typeof jsPDF !== 'function') throw new Error('PDF library not available');

      const title = options?.title?.trim() || 'Bookings Export';
      const subtitle = options?.subtitle?.trim() || '';
      const theme = options?.theme ?? 'clean';
      const includeHeaderBand = options?.includeHeaderBand ?? true;
      const includeRowStripes = options?.includeRowStripes ?? true;
      const accentHex = options?.accentHex?.trim();
      const pageBgHex = options?.pageBgHex?.trim();
      const filename =
        (() => {
          const raw = options?.filename?.trim() || `bookings-${new Date().toISOString().split('T')[0]}.pdf`;
          const withExt = raw.toLowerCase().endsWith('.pdf') ? raw : `${raw}.pdf`;
          // Sanitize for Windows/macOS forbidden filename chars
          return withExt.replace(/[\\/:*?"<>|]+/g, '-');
        })();

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const margin = 36;
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;

      const truncate = (value: any, max: number) => {
        const s = String(value ?? '');
        if (s.length <= max) return s;
        return s.slice(0, Math.max(0, max - 3)) + '...';
      };

      const hexToRgb = (hex?: string): [number, number, number] | null => {
        if (!hex) return null;
        const cleaned = hex.replace('#', '').trim();
        if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
        const r = parseInt(cleaned.slice(0, 2), 16);
        const g = parseInt(cleaned.slice(2, 4), 16);
        const b = parseInt(cleaned.slice(4, 6), 16);
        if (![r, g, b].every(Number.isFinite)) return null;
        return [r, g, b];
      };

      const colors =
        theme === 'dark'
          ? {
              pageBg: [15, 23, 42] as const,
              headerBand: [30, 41, 59] as const,
              textPrimary: [248, 250, 252] as const,
              textMuted: [148, 163, 184] as const,
              grid: [51, 65, 85] as const,
              stripe: [30, 41, 59] as const,
            }
          : {
              pageBg: [255, 255, 255] as const,
              headerBand: [37, 99, 235] as const,
              textPrimary: [15, 23, 42] as const,
              textMuted: [100, 116, 139] as const,
              grid: [226, 232, 240] as const,
              stripe: [248, 250, 252] as const,
            };

      const accentRgb = hexToRgb(accentHex);
      const pageBgRgb = hexToRgb(pageBgHex);
      const headerBandColor = accentRgb ?? colors.headerBand;
      const pageBgColor = pageBgRgb ?? colors.pageBg;

      // Page background
      doc.setFillColor(...pageBgColor);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      let y = margin;

      // Optional header band
      if (includeHeaderBand) {
        doc.setFillColor(...headerBandColor);
        if (typeof (doc as any).roundedRect === 'function') {
          (doc as any).roundedRect(margin, y - 10, usableWidth, 56, 12, 12, 'F');
        } else {
          doc.rect(margin, y - 10, usableWidth, 56, 'F');
        }
      }

      doc.setFontSize(18);
      doc.setTextColor(...colors.textPrimary);
      doc.text(title, margin + (includeHeaderBand ? 16 : 0), y + (includeHeaderBand ? 16 : 0));

      doc.setFontSize(10);
      doc.setTextColor(...colors.textMuted);
      const metaParts = [subtitle, `Generated: ${new Date().toLocaleString()}`].filter(Boolean);
      doc.text(metaParts.join('  |  '), margin + (includeHeaderBand ? 16 : 0), y + (includeHeaderBand ? 34 : 18));

      y += includeHeaderBand ? 70 : 44;

      doc.setDrawColor(...colors.grid);
      doc.line(margin, y, margin + usableWidth, y);
      y += 18;

      // Simple table (no autotable dependency)
      const cols = [
        { title: 'ID', w: 120 },
        { title: 'Guest', w: 120 },
        { title: 'Service', w: 150 },
        { title: 'Date/Time', w: 120 },
        { title: 'Amount', w: 80 },
        { title: 'Status', w: 80 },
        { title: 'Phone', w: 120 },
      ];

      const scale = usableWidth / cols.reduce((sum, c) => sum + c.w, 0);
      const scaledCols = cols.map((c) => ({ ...c, w: Math.floor(c.w * scale) }));

      const drawHeader = () => {
        doc.setFontSize(10);
        doc.setTextColor(...colors.textPrimary);
        let x = margin;
        for (const c of scaledCols) {
          doc.text(c.title, x, y);
          x += c.w;
        }
        y += 12;
        doc.setDrawColor(...colors.grid);
        doc.line(margin, y, margin + usableWidth, y);
        y += 12;
      };

      const ensureSpace = (needed: number) => {
        if (y + needed <= pageHeight - margin) return;
        doc.addPage();
        // background for new page
        doc.setFillColor(...pageBgColor);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        y = margin;
        if (includeHeaderBand) {
          doc.setFillColor(...headerBandColor);
          if (typeof (doc as any).roundedRect === 'function') {
            (doc as any).roundedRect(margin, y - 10, usableWidth, 56, 12, 12, 'F');
          } else {
            doc.rect(margin, y - 10, usableWidth, 56, 'F');
          }
        }
        doc.setFontSize(18);
        doc.setTextColor(...colors.textPrimary);
        doc.text(title, margin + (includeHeaderBand ? 16 : 0), y + (includeHeaderBand ? 16 : 0));
        doc.setFontSize(10);
        doc.setTextColor(...colors.textMuted);
        doc.text(metaParts.join('  |  '), margin + (includeHeaderBand ? 16 : 0), y + (includeHeaderBand ? 34 : 18));
        y += includeHeaderBand ? 70 : 44;
        doc.setDrawColor(...colors.grid);
        doc.line(margin, y, margin + usableWidth, y);
        y += 18;
        drawHeader();
      };

      drawHeader();

      doc.setFontSize(9);
      doc.setTextColor(...colors.textPrimary);

      for (let rowIndex = 0; rowIndex < filteredBookings.length; rowIndex++) {
        const b = filteredBookings[rowIndex];
        ensureSpace(14);

        const dateValue = b?.date
          ? `${b.date}${b.time ? ` ${b.time}` : ''}`
          : b?.category === 'hotel'
            ? `${b.dateStart} - ${b.dateEnd}`
            : `${b?.date ?? ''}${b?.time ? ` ${b.time}` : ''}`;

        const row = [
          truncate(b?.id, 18),
          truncate(b?.guest, 18),
          truncate(b?.service, 22),
          truncate(dateValue, 22),
          `$${truncate(b?.amount, 12)}`,
          truncate(b?.status, 10),
          truncate(b?.customerPhone, 16),
        ];

        if (includeRowStripes && rowIndex % 2 === 0) {
          doc.setFillColor(...colors.stripe);
          doc.rect(margin, y - 10, usableWidth, 16, 'F');
          doc.setTextColor(...colors.textPrimary);
        }

        let x = margin;
        for (let i = 0; i < row.length; i++) {
          doc.text(String(row[i] ?? ''), x, y);
          x += scaledCols[i].w;
        }
        y += 14;
      }

      // Footer page numbers
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(9);
        doc.setTextColor(...colors.textMuted);
        doc.text(`Page ${p} / ${pageCount}`, pageWidth - margin, pageHeight - margin / 2, { align: 'right' });
      }

      doc.save(filename);
      setSuccessMessage('PDF export completed successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      const message =
        error instanceof Error ? error.message : typeof error === 'string' ? error : 'Failed to export bookings to PDF';
      setPageError(`PDF export failed: ${message}`);
    } finally {
      setExportPdfLoading(false);
    }
  };

  const openPdfModal = () => setShowPdfModal(true);
  const closePdfModal = () => setShowPdfModal(false);

  const closeNotifications = () => setShowNotifications(false);

  const markNotificationRead = async (notificationId: number | string) => {
    try {
      await bookingService.markOwnerNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          String(n.id) === String(notificationId)
            ? { ...n, readAt: n.readAt ?? new Date().toISOString() }
            : n,
        ),
      );
      setUnreadNotificationCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await bookingService.markAllOwnerNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  const openNotification = async (n: OwnerNotification) => {
    if (!n) return;

    if (!n.readAt) {
      await markNotificationRead(n.id);
    }

    const bookingId = n.bookingId ?? n?.data?.id ?? null;
    if (bookingId) {
      const booking = bookings.find((b) => String(b?.id ?? '') === String(bookingId));
      if (booking) {
        openBookingDetails(booking);
        closeNotifications();
        return;
      }
    }

    setSuccessMessage(null);
    setPageError('Booking details not found in the current list. Try refreshing the page.');
    closeNotifications();
  };

  const openBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
    setOpenActionBookingId(null);
  };

  const closeBookingDetails = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const openedFromQueryRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openBookingId = params.get('openBookingId');
    if (!openBookingId) return;

    if (openedFromQueryRef.current === String(openBookingId)) return;
    if (!Array.isArray(bookings) || bookings.length === 0) return;

    const booking = bookings.find((b) => String(b?.id ?? '') === String(openBookingId));
    openedFromQueryRef.current = String(openBookingId);

    if (booking) {
      openBookingDetails(booking);
      return;
    }

    setSuccessMessage(null);
    setPageError('Booking details not found in the current list. Try refreshing the page.');
  }, [bookings, location.search]);

  const updateBookingStatus = async (booking: any, nextStatus: 'paid' | 'pending' | 'canceled') => {
    if (!booking?.id) return;

    try {
      setUpdatingBookingId(booking.id);
      setPageError(null);
      setSuccessMessage(null);

      const result = await bookingService.updateBookingStatus(booking.id, nextStatus);
      const updated = result?.data ?? { ...booking, status: nextStatus };

      setBookings((prev) => {
        const next = prev.map((b) => (b?.id === booking.id ? { ...b, ...updated } : b));
        try {
          localStorage.setItem(BOOKINGS_CACHE_KEY, JSON.stringify(next));
        } catch {
          // ignore cache write errors
        }
        return next;
      });

      setSelectedBooking((prev) => (prev?.id === booking.id ? { ...prev, ...updated } : prev));
      setSuccessMessage(result?.message || `Booking ${booking.id} updated to ${nextStatus}`);

      // Refresh stats (status changes affect dashboard counts)
      fetchStats();
    } catch (error: any) {
      console.error('Update booking status error:', error);
      setPageError(error?.message || 'Failed to update booking status');
    } finally {
      setUpdatingBookingId(null);
      setOpenActionBookingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle2 size={10} />;
      case 'pending': return <Clock size={10} />;
      case 'canceled': return <XCircle size={10} />;
      default: return <Clock size={10} />;
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

  const getBookingImage = (booking: any): string | null => {
    const explicit =
      booking?.image ||
      booking?.serviceImage ||
      booking?.hotelImage ||
      booking?.destinationImage ||
      booking?.rentalImage ||
      booking?.vehicleImage ||
      booking?.rental?.image;
    if (typeof explicit === 'string' && explicit.trim()) return explicit;

    const serviceName = String(booking?.service ?? '').trim();
    const routeName = String(booking?.route ?? '').trim();

    const hotel =
      ALL_HOTELS.find((h) => h.name === serviceName) ||
      ALL_HOTELS.find((h) => serviceName && h.name && serviceName.toLowerCase().includes(h.name.toLowerCase())) ||
      ALL_HOTELS.find((h) => routeName && h.location && routeName.toLowerCase().includes(h.location.toLowerCase()));

    if (hotel?.image) return hotel.image;

    const vehicleName = String(booking?.vehicleType ?? booking?.service ?? '').trim();
    const vehicle =
      RENTAL_VEHICLES.find((v) => v.name === vehicleName) ||
      RENTAL_VEHICLES.find((v) => vehicleName && v.name && vehicleName.toLowerCase().includes(v.name.toLowerCase()));

    if (vehicle?.image) return vehicle.image;

    return null;
  };

  const activeFilterCount =
    Object.values(filters).filter((val) => val !== 'all' && val !== '').length +
    (serviceFilter !== 'all' ? 1 : 0) +
    (dateRange !== 'last7' ? 1 : 0) +
    (searchTerm ? 1 : 0);

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
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input 
                className="w-full pl-10 pr-10 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 rounded-xl text-sm transition-all shadow-sm" 
                placeholder="Search Booking ID, Guest Name..."
                type="text"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-end">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setServiceFilter('all');
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                    serviceFilter === 'all'
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceFilter('hotel');
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                    serviceFilter === 'hotel'
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  Hotel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceFilter('transport');
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap",
                    serviceFilter === 'transport'
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  Transport
                </button>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-10 pr-10 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <option value="last1" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 1 Day</option>
                  <option value="last3" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 3 Days</option>
                  <option value="last7" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 7 Days</option>
                  <option value="all" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">All time</option>
                </select>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                <RotateCcw size={16} />
                Clear
              </button>

              <button 
                onClick={handleExport}
                disabled={exportLoading}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} /> 
                {exportLoading ? '...' : 'CSV'}
              </button>

              <button 
                onClick={openPdfModal}
                disabled={exportPdfLoading}
                className="px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center gap-2 hover:opacity-90 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} /> 
                {exportPdfLoading ? '...' : 'PDF'}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal size={12} /> Quick Filters:
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'all')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-full transition-colors",
                    filters.status === 'all'
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'paid')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1",
                    filters.status === 'paid'
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  )}
                >
                  <CheckCircle2 size={10} /> Paid
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'pending')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1",
                    filters.status === 'pending'
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  )}
                >
                  <Clock size={10} /> Pending
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('status', 'canceled')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1",
                    filters.status === 'canceled'
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                  )}
                >
                  <XCircle size={10} /> Canceled
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border",
                  amountRangeInvalid
                    ? "bg-rose-50/70 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/40"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Amount
                </span>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    placeholder="Min"
                    className={cn(
                      "pl-7 pr-2 py-1.5 text-[10px] rounded-lg w-24 outline-none bg-white dark:bg-slate-900 border",
                      amountRangeInvalid
                        ? "border-rose-300 dark:border-rose-800 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
                <span className="text-slate-400 text-[10px]">-</span>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    placeholder="Max"
                    className={cn(
                      "pl-7 pr-2 py-1.5 text-[10px] rounded-lg w-24 outline-none bg-white dark:bg-slate-900 border",
                      amountRangeInvalid
                        ? "border-rose-300 dark:border-rose-800 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500"
                    )}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
                  <span className="text-[8px] font-bold">
                    {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {amountRangeInvalid && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              Min amount must be less than or equal to max amount.
            </p>
          )}
        </div>

        {/* PDF Export Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closePdfModal}>
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Export PDF settings"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Export PDF</h3>
                <button
                  type="button"
                  onClick={closePdfModal}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Edit the PDF style and filename before downloading.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={pdfOptions.title}
                    onChange={(e) => setPdfOptions((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                    placeholder="Bookings Export"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={pdfOptions.subtitle}
                    onChange={(e) => setPdfOptions((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                    placeholder="Cambodia Travel"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Theme
                    </label>
                    <select
                      value={pdfOptions.theme}
                      onChange={(e) => {
                        const nextTheme = e.target.value as any;
                        setPdfOptions((prev) => ({
                          ...prev,
                          theme: nextTheme,
                          accentHex: nextTheme === 'dark' ? '#1e293b' : '#2563eb',
                          pageBgHex: nextTheme === 'dark' ? '#0f172a' : '#ffffff',
                        }));
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                    >
                      <option value="clean">Clean</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Filename
                    </label>
                    <input
                      type="text"
                      value={pdfOptions.filename}
                      onChange={(e) => setPdfOptions((prev) => ({ ...prev, filename: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                      placeholder="bookings-YYYY-MM-DD.pdf"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Accent color</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Header band color</p>
                    </div>
                    <input
                      type="color"
                      value={pdfOptions.accentHex}
                      onChange={(e) => setPdfOptions((prev) => ({ ...prev, accentHex: e.target.value }))}
                      className="h-9 w-12 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent"
                      aria-label="Accent color"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Background</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Page background color</p>
                    </div>
                    <input
                      type="color"
                      value={pdfOptions.pageBgHex}
                      onChange={(e) => setPdfOptions((prev) => ({ ...prev, pageBgHex: e.target.value }))}
                      className="h-9 w-12 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent"
                      aria-label="Page background"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Header band</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Colored header background</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeHeaderBand}
                    onChange={(e) => setPdfOptions((prev) => ({ ...prev, includeHeaderBand: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Row stripes</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alternating table rows</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeRowStripes}
                    onChange={(e) => setPdfOptions((prev) => ({ ...prev, includeRowStripes: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closePdfModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleExportPdf(pdfOptions);
                    closePdfModal();
                  }}
                  disabled={exportPdfLoading}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportPdfLoading ? 'Exporting...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {showBookingModal && selectedBooking && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={closeBookingDetails}
            role="dialog"
            aria-modal="true"
            aria-label="Booking details"
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xl w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedBooking.id}</h3>
                  <div className="mt-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full",
                        getStatusColor(selectedBooking.status),
                      )}
                    >
                      {getStatusIcon(selectedBooking.status)}
                      {String(selectedBooking.status || 'pending').charAt(0).toUpperCase() +
                        String(selectedBooking.status || 'pending').slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadReceiptPdf}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                    aria-label="Download receipt"
                  >
                    <Download size={16} />
                    Receipt
                  </button>
                  <button
                    type="button"
                    onClick={closeBookingDetails}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div
                ref={receiptRef}
                id="owner-booking-receipt"
                className="mt-5 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="bg-blue-600 px-5 py-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Official Receipt</p>
                  <h2 className="text-lg font-serif italic mt-1">Komrong Sanctuary</h2>
                  <p className="text-[11px] opacity-90 mt-0.5">Owner Booking Receipt</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{selectedBooking.id}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatDateTime(selectedBooking.createdAt ?? selectedBooking.created_at ?? selectedBooking.date)}
                      </p>
                      {String(selectedBooking.category ?? '').toLowerCase() === 'hotel' && (
                        <p className="mt-0.5 text-xs text-slate-500">Check-in / Check-out: {formatStay(selectedBooking)}</p>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const bookingImage = getBookingImage(selectedBooking);
                    if (!bookingImage) return null;

                    return (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img
                          src={bookingImage}
                          alt={selectedBooking.service || 'Booking'}
                          className="w-full h-40 object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </div>
                    );
                  })()}

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</p>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedBooking.guest || '-'}</p>
                        {selectedBooking.customerEmail && (
                          <p className="mt-0.5 text-xs text-slate-500">{selectedBooking.customerEmail}</p>
                        )}
                        {selectedBooking.customerPhone && (
                          <p className="mt-0.5 text-xs text-slate-500">{selectedBooking.customerPhone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</p>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedBooking.service || '-'}</p>
                        {selectedBooking.route && <p className="mt-0.5 text-xs text-slate-500">{selectedBooking.route}</p>}
                        {selectedBooking.roomType && <p className="mt-0.5 text-xs text-slate-500">{selectedBooking.roomType}</p>}
                        {selectedBooking.vehicleType && <p className="mt-0.5 text-xs text-slate-500">{selectedBooking.vehicleType}</p>}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</p>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">${formatMoney(selectedBooking.amount)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{selectedBooking.pax ?? '-'} pax</p>
                        {selectedBooking.paymentMethod && (
                          <p className="mt-0.5 text-xs text-slate-500">Method: {selectedBooking.paymentMethod}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {String(selectedBooking.status || 'pending').charAt(0).toUpperCase() +
                            String(selectedBooking.status || 'pending').slice(1)}
                        </p>
                        {selectedBooking.reference && (
                          <p className="mt-0.5 text-xs text-slate-500">Ref: {selectedBooking.reference}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Special Requests</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    Thank you for using Komrong.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking, 'pending')}
                  disabled={updatingBookingId === selectedBooking.id || selectedBooking.status === 'pending'}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Pending
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking, 'paid')}
                  disabled={updatingBookingId === selectedBooking.id || selectedBooking.status === 'paid'}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Paid
                </button>
                <button
                  type="button"
                  onClick={() => updateBookingStatus(selectedBooking, 'canceled')}
                  disabled={updatingBookingId === selectedBooking.id || selectedBooking.status === 'canceled'}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Booking
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
            {/* Bookings Table - Compact Version */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[9px] uppercase font-bold tracking-widest text-slate-500">
                    <th className="px-4 py-3">BOOKING ID</th>
                    <th className="px-4 py-3">GUEST</th>
                    <th className="px-4 py-3">SERVICE</th>
                    <th className="px-4 py-3">ROUTE</th>
                    <th className="px-4 py-3">DATE</th>
                    <th className="px-4 py-3">PAX</th>
                    <th className="px-4 py-3">AMOUNT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking: any) => (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer text-[11px]"
                        onClick={() => openBookingDetails(booking)}
                      >
                        <td className="px-4 py-3 font-medium text-blue-600">{booking.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[120px]" title={booking.guest}>{booking.guest}</span>
                            {booking.customerEmail && (
                              <span className="text-[8px] text-slate-400 truncate max-w-[120px]" title={booking.customerEmail}>
                                {booking.customerEmail}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="truncate max-w-[150px] block" title={booking.service}>
                            {booking.service}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block truncate max-w-[150px]" title={booking.route}>
                            {booking.route}
                          </span>
                          {booking.roomType && (
                            <span className="text-[8px] text-slate-400 block truncate max-w-[150px]">{booking.roomType}</span>
                          )}
                          {booking.vehicleType && (
                            <span className="text-[8px] text-slate-400 block truncate max-w-[150px]">{booking.vehicleType}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            {booking.date ? (
                              <>
                                <span className="font-medium">{booking.date}</span>
                                <span className="text-[8px] text-slate-400">{booking.time}</span>
                                {booking.category === 'hotel' && booking.dateStart && booking.dateEnd && (
                                  <span className="text-[8px] text-slate-400">Stay: {booking.dateStart} → {booking.dateEnd}</span>
                                )}
                              </>
                            ) : booking.category === 'hotel' ? (
                              <>
                                <span className="font-medium">{booking.dateStart}</span>
                                <span className="text-[8px] text-slate-400">→ {booking.dateEnd}</span>
                              </>
                            ) : (
                              <>
                                <span className="font-medium">{booking.date || '-'}</span>
                                <span className="text-[8px] text-slate-400">{booking.time || ''}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{booking.pax}</td>
                        <td className="px-4 py-3 font-medium">${formatMoney(booking.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold rounded-full whitespace-nowrap",
                            getStatusColor(booking.status)
                          )}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionBookingId((prev) => (prev === booking.id ? null : booking.id));
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            aria-label="Booking actions"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {openActionBookingId === booking.id && (
                            <div className="absolute right-4 top-8 z-10 w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden text-[10px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBookingDetails(booking);
                                }}
                                className="w-full text-left px-2 py-1.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                              >
                                View
                              </button>

                              {booking.status !== 'paid' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateBookingStatus(booking, 'paid');
                                  }}
                                  disabled={updatingBookingId === booking.id}
                                  className="w-full text-left px-2 py-1.5 font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Mark Paid
                                </button>
                              )}

                              {booking.status !== 'pending' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateBookingStatus(booking, 'pending');
                                  }}
                                  disabled={updatingBookingId === booking.id}
                                  className="w-full text-left px-2 py-1.5 font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Mark Pending
                                </button>
                              )}

                              {booking.status !== 'canceled' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateBookingStatus(booking, 'canceled');
                                  }}
                                  disabled={updatingBookingId === booking.id}
                                  className="w-full text-left px-2 py-1.5 font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-xs">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Compact */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-medium">
                {filteredBookings.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filteredBookings.length)} of {filteredBookings.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-0.5">
                  {getPageItems().map((page, i) =>
                    page === '...' ? (
                      <span key={`dots-${i}`} className="w-6 h-6 inline-flex items-center justify-center text-[10px] font-medium text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-6 h-6 rounded text-[10px] font-medium transition-all",
                          page === safeCurrentPage
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
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
                  className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
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
