import { apiRequest } from './api';

export async function listCustomerMessages() {
  return apiRequest('/customer/messages', { method: 'GET' });
}

export async function getCustomerConversation(ownerId) {
  if (ownerId === null || ownerId === undefined || ownerId === '') {
    throw new Error('ownerId is required');
  }

  return apiRequest(`/customer/messages/${encodeURIComponent(String(ownerId))}`, { method: 'GET' });
}

export async function sendCustomerMessage({ receiver_id, content }) {
  if (!receiver_id) throw new Error('receiver_id is required');
  if (!content) throw new Error('content is required');

  return apiRequest('/customer/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      receiver_id,
      content,
    }),
  });
}

export const customerMessageService = {
  listCustomerMessages,
  getCustomerConversation,
  sendCustomerMessage,
};

