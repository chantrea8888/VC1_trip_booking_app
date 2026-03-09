import type { ComponentType } from 'react';
import {
  Briefcase,
  CalendarDays,
  History,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', path: '/users', icon: Users },
  { id: 'owners', label: 'Owner Management', path: '/owners', icon: Briefcase },
  { id: 'destinations', label: 'Destinations', path: '/destinations', icon: MapPin },
  { id: 'bookings', label: 'Bookings', path: '/bookings', icon: CalendarDays },
  { id: 'finances', label: 'Finances', path: '/finances', icon: Wallet },
];

export const SYSTEM_MENU_ITEMS: MenuItem[] = [
  { id: 'logs', label: 'System Logs', path: '/logs', icon: History },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

const baseItems = [...MAIN_MENU_ITEMS, ...SYSTEM_MENU_ITEMS];

export const TAB_TO_PATH: Record<string, string> = baseItems.reduce((acc, item) => {
  acc[item.id] = item.path;
  return acc;
}, {} as Record<string, string>);

export const PATH_TO_TAB: Record<string, string> = baseItems.reduce((acc, item) => {
  acc[item.path] = item.id;
  return acc;
}, {} as Record<string, string>);

PATH_TO_TAB['/owners/applications'] = 'owners';
PATH_TO_TAB['/owners/applications/details'] = 'owners';
PATH_TO_TAB['/owners/details'] = 'owners';
PATH_TO_TAB['/owners/request-detail'] = 'ownerRequestDetail';
PATH_TO_TAB['/profile'] = 'profile';
TAB_TO_PATH.ownerRequestDetail = '/owners/request-detail';
TAB_TO_PATH.profile = '/profile';
