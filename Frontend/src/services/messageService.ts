import { apiRequest } from './api';

type MessagePayload = Record<string, unknown>;

const requestWithFallback = async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
  try {
    return await apiRequest<T>(path, options);
  } catch (error) {
    if (path.startsWith('/owner/')) {
      const altPath = path.replace('/owner', '');
      return await apiRequest<T>(altPath, options);
    }

    throw error;
  }
};

export type MessageService = {
  getOwnerMessages: () => Promise<any>;
  getOwnerConversation: (customerId: string | number) => Promise<any>;
  sendOwnerMessage: (payload: MessagePayload) => Promise<any>;
  getOwnerUnreadCount: () => Promise<any>;
  getCustomerMessages: () => Promise<any>;
  getCustomerConversation: (ownerId: string | number) => Promise<any>;
  sendCustomerMessage: (payload: MessagePayload) => Promise<any>;
  getCustomerUnreadCount: () => Promise<any>;
};

export const messageService: MessageService = {
  getOwnerMessages: () => requestWithFallback('/owner/messages'),
  getOwnerConversation: (customerId) => requestWithFallback(`/owner/messages/${customerId}`),
  sendOwnerMessage: (payload) =>
    requestWithFallback('/owner/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getOwnerUnreadCount: () => requestWithFallback('/owner/messages/unread-count'),

  getCustomerMessages: () => apiRequest('/customer/messages'),
  getCustomerConversation: (ownerId) => apiRequest(`/customer/messages/${ownerId}`),
  sendCustomerMessage: (payload) =>
    apiRequest('/customer/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCustomerUnreadCount: () => apiRequest('/customer/messages/unread-count'),
};
