import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
}

export interface ActivityItem {
  id: string;
  type: 'booking' | 'payout' | 'message' | 'review';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  status: 'active' | 'draft';
  image: string;
  city?: string;
  country?: string;
  address?: string;
  description?: string;
  create_at?: string;
  update_at?: string;
  star_rating?: number;
  is_active?: boolean;
  destination?: string;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type?: string;
  price?: number;
  max_capacity?: number;
  room_number?: string;
  room_floor?: string;
  size?: string;
  description?: string;
  beds?: string;
  baths?: number;
  amenities?: string[];
  images?: string[];
  image?: string;
  available?: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  model: string;
  driver: {
    name: string;
    avatar: string;
  };
  status: 'on-route' | 'available' | 'maintenance';
}

export interface Booking {
  id: string;
  guestName: string;
  service: string;
  route: string;
  date: string;
  time: string;
  pax: number;
  amount: number;
  status: 'paid' | 'pending' | 'canceled';
}
