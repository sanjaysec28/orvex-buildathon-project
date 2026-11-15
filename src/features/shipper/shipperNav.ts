import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Bookmark,
  CalendarCheck2,
  CreditCard,
  FileText,
  Handshake,
  Home,
  MapPin,
  Package,
  PlusCircle,
  Search,
  Settings,
  Truck,
  User,
} from 'lucide-react';

export interface ShipperSidebarNavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  matchExact?: boolean;
  hasUnreadBadge?: boolean;
}

export const SHIPPER_SIDEBAR_ITEMS: readonly ShipperSidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/shipper', icon: Home, matchExact: true },
  { id: 'post', label: 'Post a Shipment', to: '/shipper/post', icon: Package },
  { id: 'shipments', label: 'My Shipments', to: '/shipper/shipments', icon: Truck },
  { id: 'trucks', label: 'Find Trucks', to: '/shipper/trucks', icon: Search },
  { id: 'offers', label: 'Offers & Negotiations', to: '/shipper/offers', icon: Handshake },
  { id: 'bookings', label: 'Active Bookings', to: '/shipper/bookings', icon: CalendarCheck2 },
  { id: 'tracking', label: 'Live Tracking', to: '/shipper/tracking', icon: MapPin },
  { id: 'payments', label: 'Payments & Invoices', to: '/shipper/payments', icon: CreditCard },
  { id: 'locations', label: 'Saved Locations', to: '/shipper/locations', icon: Bookmark },
  {
    id: 'notifications',
    label: 'Notifications',
    to: '/shipper/notifications',
    icon: Bell,
    hasUnreadBadge: true,
  },
  { id: 'documents', label: 'Document Centre', to: '/shipper/documents', icon: FileText },
  { id: 'profile', label: 'Profile & Settings', to: '/shipper/profile', icon: Settings },
] as const;

export interface ShipperBottomNavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  matchExact?: boolean;
  isPrimaryAction?: boolean;
}

export const SHIPPER_MOBILE_BOTTOM_ITEMS: readonly ShipperBottomNavItem[] = [
  { id: 'home', label: 'Home', to: '/shipper', icon: Home, matchExact: true },
  { id: 'shipments', label: 'Shipments', to: '/shipper/shipments', icon: Truck },
  { id: 'post', label: 'Post', to: '/shipper/post', icon: PlusCircle, isPrimaryAction: true },
  { id: 'bookings', label: 'Bookings', to: '/shipper/bookings', icon: CalendarCheck2 },
  { id: 'profile', label: 'Profile', to: '/shipper/profile', icon: User },
] as const;

export function isShipperPathActive(
  pathname: string,
  targetPath: string,
  matchExact?: boolean,
): boolean {
  if (matchExact) {
    return pathname === targetPath;
  }
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}
