import React from 'react';
import { LayoutDashboard, MapPin, Bus, CalendarCheck, MessageSquare, Tag, BarChart3, Wallet, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/' },
  { id: 'destinations', label: 'Destinations', icon: MapPin, path: '/destinations' },
  { id: 'transport', label: 'Transport', icon: Bus, path: '/transport' },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
  { id: 'promotions', label: 'Promotions', icon: Tag, path: '/promotions' },
];

export const INSIGHT_ITEMS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'financials', label: 'Financials', icon: Wallet, path: '/financials' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const MOCK_REVENUE_DATA = [
  { name: 'Mon', value: 1200 },
  { name: 'Tue', value: 1900 },
  { name: 'Wed', value: 1500 },
  { name: 'Thu', value: 2800 },
  { name: 'Fri', value: 2400 },
  { name: 'Sat', value: 3800 },
  { name: 'Sun', value: 3200 },
];

