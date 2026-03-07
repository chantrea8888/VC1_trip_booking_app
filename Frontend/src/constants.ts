import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Bus, 
  CalendarCheck, 
  MessageSquare, 
  Tag, 
  BarChart3, 
  Wallet, 
  Settings,
  CreditCard,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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

export const MOCK_ANALYTICS_REVENUE = [
  { name: 'Jan', value: 4500 },
  { name: 'Feb', value: 5200 },
  { name: 'Mar', value: 4800 },
  { name: 'Apr', value: 6100 },
  { name: 'May', value: 7200 },
  { name: 'Jun', value: 8500 },
  { name: 'Jul', value: 7900 },
  { name: 'Aug', value: 9200 },
  { name: 'Sep', value: 11000 },
  { name: 'Oct', value: 10500 },
  { name: 'Nov', value: 12500 },
  { name: 'Dec', value: 14800 },
];
