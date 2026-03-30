import { apiRequest } from './api';

export async function requireCustomerAccess() {
  return apiRequest('/customer/access', { method: 'GET' });
}

export async function requireOwnerAccess() {
  return apiRequest('/owner/access', { method: 'GET' });
}

export const accessService = {
  requireCustomerAccess,
  requireOwnerAccess,
};

