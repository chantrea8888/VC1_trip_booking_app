import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const hotelSelectionService = {
  // Get all hotel selections for the authenticated customer
  getAll: async () => {
    try {
      const response = await apiRequest('/hotel-selections', {
        method: 'GET',
      });
      return { data: response || [], success: true };
    } catch (error) {
      console.error('Error fetching hotel selections:', error);
      return { data: [], success: false, error };
    }
  },

  // Create a new hotel selection
  create: async (selectionData) => {
    try {
      const response = await apiRequest('/hotel-selections', {
        method: 'POST',
        body: JSON.stringify(selectionData),
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating hotel selection:', error);
      throw error;
    }
  },

  // Get a specific hotel selection
  getOne: async (id) => {
    try {
      const response = await apiRequest(`/hotel-selections/${id}`, {
        method: 'GET',
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching hotel selection:', error);
      return { success: false, error };
    }
  },

  // Update a hotel selection
  update: async (id, selectionData) => {
    try {
      const response = await apiRequest(`/hotel-selections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(selectionData),
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating hotel selection:', error);
      throw error;
    }
  },

  // Delete a hotel selection
  delete: async (id) => {
    try {
      await apiRequest(`/hotel-selections/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting hotel selection:', error);
      throw error;
    }
  },

  // Get selections by status (pending, confirmed, cancelled, completed)
  getByStatus: async (status) => {
    try {
      const response = await apiRequest(`/hotel-selections/status/${status}`, {
        method: 'GET',
      });
      return { data: response || [], success: true };
    } catch (error) {
      console.error('Error fetching selections by status:', error);
      return { data: [], success: false, error };
    }
  },

  // Confirm a hotel selection
  confirm: async (id) => {
    try {
      const response = await apiRequest(`/hotel-selections/${id}/confirm`, {
        method: 'POST',
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error confirming hotel selection:', error);
      throw error;
    }
  },

  // Cancel a hotel selection
  cancel: async (id) => {
    try {
      const response = await apiRequest(`/hotel-selections/${id}/cancel`, {
        method: 'POST',
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error cancelling hotel selection:', error);
      throw error;
    }
  },
};
