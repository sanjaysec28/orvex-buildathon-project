import { Home, Route, UserRound } from 'lucide-react';
import type { NavItemConfig } from '../../types/navigation';

export const TRANSPORTER_NAV_ITEMS: readonly NavItemConfig[] = [
  {
    id: 'transporter-home',
    path: '/transporter',
    labelKey: 'nav.home',
    icon: Home,
    end: true,
  },
  {
    id: 'transporter-trips',
    path: '/transporter/trips',
    labelKey: 'nav.trips',
    icon: Route,
  },
  {
    id: 'transporter-profile',
    path: '/transporter/profile',
    labelKey: 'nav.profile',
    icon: UserRound,
  },
];
