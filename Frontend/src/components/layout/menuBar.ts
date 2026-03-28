import { 
  Home,
  Calendar,
  MapPin,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  FileText,
  BarChart3,
  Building,
  Car,
  Hotel
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  badge?: string;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: Calendar,
    path: '/bookings'
  },
  {
    id: 'destinations',
    label: 'Destinations',
    icon: MapPin,
    path: '/destinations'
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    path: '/payments'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    path: '/customers'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/reports'
  }
];

export const SYSTEM_MENU_ITEMS: MenuItem[] = [
  {
    id: 'hotels',
    label: 'Hotels',
    icon: Hotel,
    path: '/hotels'
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Car,
    path: '/transport'
  },
  {
    id: 'buildings',
    label: 'Buildings',
    icon: Building,
    path: '/buildings'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    path: '/help'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    path: '/documents'
  }
];
