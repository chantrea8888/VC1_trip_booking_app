import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const bookingService = {
  // Get all bookings (for owner page)
  getBookings: async (filters = {}) => {
    try {
      console.log('🔍 Fetching bookings with filters:', filters);
      console.log('🌐 API URL:', API_BASE_URL);
      
      const queryParams = new URLSearchParams();
      if (filters.service && filters.service !== 'all') queryParams.append('service', filters.service);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.date_range && filters.date_range !== 'all') queryParams.append('date_range', filters.date_range);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.min_amount) queryParams.append('min_amount', filters.min_amount);
      if (filters.max_amount) queryParams.append('max_amount', filters.max_amount);
      if (filters.guest_name) queryParams.append('guest_name', filters.guest_name);
      if (filters.booking_id) queryParams.append('booking_id', filters.booking_id);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const url = `/bookings${queryString}`;
      
      console.log('📡 Calling API:', url);
      
      const response = await apiRequest(url, {
        method: 'GET',
      });
      
      console.log('✅ API Response:', response);
      
      // Make sure we return the data in the format expected
      return {
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('Error details:', error.message);
      return { data: [] };
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      console.log('📝 Creating booking:', bookingData);
      
      const response = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      
      console.log('✅ Booking created:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw error;
    }
  },

  // Get bookings for a specific customer (restricted by backend)
  getCustomerBookings: async (customerId) => {
    const response = await apiRequest(`/bookings/customer/${customerId}`, {
      method: 'GET',
    });

    return {
      data: response.data || [],
    };
  },

  // Get booking statistics
  getBookingStats: async () => {
    try {
      console.log('📊 Fetching booking stats');
      const response = await apiRequest('/bookings/stats', {
        method: 'GET',
      });
      console.log('✅ Stats received:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return {
        total_bookings: '0',
        active_guests: '0',
        pending_payments: '$0'
      };
    }
  },

  // Export bookings to CSV
  exportBookings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.service && filters.service !== 'all') queryParams.append('service', filters.service);
      if (filters.date_range && filters.date_range !== 'all') queryParams.append('date_range', filters.date_range);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      console.log('📥 Exporting bookings to CSV');
      
      const response = await fetch(`${API_BASE_URL}/bookings/export${queryString}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          ...(localStorage.getItem('auth_token')
            ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('❌ Error exporting bookings:', error);
      throw error;
    }
  }
};
