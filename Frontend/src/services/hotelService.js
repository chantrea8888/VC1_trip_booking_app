import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const hotelService = {
  // Get all active destinations/hotels from database (public - no authentication required)
  getAllHotels: async () => {
    try {
      console.log('📍 Fetching destinations from:', `${API_BASE_URL}/hotels-public`);
      const response = await fetch(`${API_BASE_URL}/hotels-public`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch hotels from server`);
      }
      const data = await response.json();
      console.log('✅ Hotels data received from API:', data);
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('❌ Error fetching hotels from API:', error);
      console.warn('⚠️ Using empty list as fallback - ensure destinations exist in database');
      return { data: [] };
    }
  },

  // Get owner's hotels (requires authentication)
  getHotels: async () => {
    try {
      const response = await apiRequest('/hotels', {
        method: 'GET',
      });
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return { data: [] };
    }
  },

  // Create new hotel
  createHotel: async (hotelData) => {
    try {
      const response = await apiRequest('/hotels', {
        method: 'POST',
        body: JSON.stringify(hotelData),
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  },

  // Update hotel
  updateHotel: async (id, hotelData) => {
    try {
      const response = await apiRequest(`/hotels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(hotelData),
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  },

  // Delete hotel
  deleteHotel: async (id) => {
    try {
      const response = await apiRequest(`/hotels/${id}`, {
        method: 'DELETE',
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  },

  // Get single hotel
  getHotel: async (id) => {
    try {
      const response = await apiRequest(`/hotels/${id}`, {
        method: 'GET',
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching hotel:', error);
      return { data: null };
    }
  }
};

