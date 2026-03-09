export type Role = 'Super Admin' | 'Admin' | 'Moderator' | 'Support' | 'User' | 'Owner' | 'Customer';
export type Status = 'Active' | 'Inactive' | 'Pending' | 'Alert' | 'Success' | 'Confirmed' | 'Cancelled' | 'Refunded';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinedDate: string;
  avatar?: string;
}

export interface Owner {
  id: string;
  businessName: string;
  ownerName: string;
  businessType: 'Accommodation' | 'Transport' | 'Both';
  destinations: number;
  status: Status;
}

export interface Booking {
  id: string;
  customer: {
    name: string;
    avatar?: string;
    initials: string;
  };
  destination: string;
  tripDate: string;
  totalPrice: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  status: Status;
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  category: 'BEACH' | 'MOUNTAIN' | 'CITY';
  basePrice: string;
  status: Status;
  image: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  time: string;
  user: {
    name: string;
    role: Role;
    initials: string;
  };
  action: string;
  ipAddress: string;
  details: string;
  status: Status;
}
