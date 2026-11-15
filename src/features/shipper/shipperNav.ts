import { Building2, Home, Package } from 'lucide-react';
import type { NavItemConfig } from '../../types/navigation';

export const SHIPPER_NAV_ITEMS: readonly NavItemConfig[] = [
  {
    id: 'shipper-home',
    path: '/shipper',
    labelKey: 'nav.home',
    icon: Home,
    end: true,
  },
  {
    id: 'shipper-shipments',
    path: '/shipper/shipments',
    labelKey: 'nav.shipments',
    icon: Package,
  },
  {
    id: 'shipper-profile',
    path: '/shipper/profile',
    labelKey: 'nav.profile',
    icon: Building2,
  },
];
