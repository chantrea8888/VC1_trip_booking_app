type MessagePayload = {
  id: number | string;
  sender_id: number | string;
  receiver_id: number | string;
  message: string;
  created_at: string;
  read_at?: string | null;
  sender?: { id: number | string; name?: string; full_name?: string; email?: string };
  receiver?: { id: number | string; name?: string; full_name?: string; email?: string };
};

export const messageService: {
  getOwnerMessages: () => Promise<any>;
  getOwnerConversation: (customerId: string | number) => Promise<any>;
  sendOwnerMessage: (payload: { receiver_id: string | number; message: string }) => Promise<any>;
  getOwnerUnreadCount: () => Promise<{ unread_count: number }>;
  getCustomerMessages: () => Promise<any>;
  getCustomerConversation: (ownerId: string | number) => Promise<any>;
  sendCustomerMessage: (payload: { receiver_id: string | number; message: string }) => Promise<any>;
  getCustomerUnreadCount: () => Promise<{ unread_count: number }>;
};
