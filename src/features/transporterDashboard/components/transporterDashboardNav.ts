import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Handshake,
  Home,
  MapPin,
  Route,
  Search,
  Settings,
  Truck,
  User,
  UserCheck,
} from 'lucide-react';

export interface TransporterSidebarNavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  matchExact?: boolean;
  hasUnreadBadge?: boolean;
}

export const TRANSPORTER_SIDEBAR_ITEMS: readonly TransporterSidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/transporter', icon: Home, matchExact: true },
  { id: 'vehicles', label: 'My Vehicles', to: '/transporter/vehicles', icon: Truck },
  { id: 'drivers', label: 'My Drivers', to: '/transporter/drivers', icon: UserCheck },
  { id: 'loads', label: 'Load Discovery', to: '/transporter/loads', icon: Search },
  { id: 'availability', label: 'Availability', to: '/transporter/availability', icon: Calendar },
  { id: 'trips', label: 'My Trips', to: '/transporter/trips', icon: Route },
  { id: 'offers', label: 'Offers & Negotiations', to: '/transporter/offers', icon: Handshake },
  { id: 'earnings', label: 'Earnings', to: '/transporter/earnings', icon: BarChart3 },
  { id: 'tracking', label: 'Live Tracking', to: '/transporter/tracking', icon: MapPin },
  {
    id: 'notifications',
    label: 'Notifications',
    to: '/transporter/notifications',
    icon: Bell,
    hasUnreadBadge: true,
  },
  { id: 'documents', label: 'Document Centre', to: '/transporter/documents', icon: FileText },
  { id: 'profile', label: 'Profile & Settings', to: '/transporter/profile', icon: Settings },
] as const;

export interface TransporterBottomNavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  matchExact?: boolean;
}

export const TRANSPORTER_MOBILE_BOTTOM_ITEMS: readonly TransporterBottomNavItem[] = [
  { id: 'home', label: 'Home', to: '/transporter', icon: Home, matchExact: true },
  { id: 'loads', label: 'Loads', to: '/transporter/loads', icon: Search },
  { id: 'trips', label: 'Trips', to: '/transporter/trips', icon: Truck },
  { id: 'earnings', label: 'Earnings', to: '/transporter/earnings', icon: BarChart3 },
  { id: 'profile', label: 'Profile', to: '/transporter/profile', icon: User },
] as const;

export function isTransporterPathActive(
  pathname: string,
  targetPath: string,
  matchExact?: boolean,
): boolean {
  if (matchExact) {
    return pathname === targetPath;
  }
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}
