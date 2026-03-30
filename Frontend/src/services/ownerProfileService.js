import { apiRequest } from './api';

export async function getOwnerProfile() {
  return apiRequest('/owner/profile', { method: 'GET' });
}

export async function updateOwnerProfile(payload) {
  return apiRequest('/owner/profile', {
    method: 'PUT',
    body: JSON.stringify(payload ?? {}),
  });
}

export const ownerProfileService = {
  getOwnerProfile,
  updateOwnerProfile,
};

