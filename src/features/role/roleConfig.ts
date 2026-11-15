import type { UserRole } from '../../types/domain';

export interface RoleOptionConfig {
  role: UserRole;
  iconName: 'truck' | 'package';
  illustrationSrc: string;
  titleKey: string;
  roleTagKey: string;
  descriptionKey: string;
}

export const ROLE_OPTIONS: readonly RoleOptionConfig[] = [
  {
    role: 'transporter',
    iconName: 'truck',
    illustrationSrc: '/assets/orvex-transporter-truck.webp',
    titleKey: 'roles.transporter.cardTitle',
    roleTagKey: 'roles.transporter.cardRoleTag',
    descriptionKey: 'roles.transporter.cardDescription',
  },
  {
    role: 'shipper',
    iconName: 'package',
    illustrationSrc: '/assets/orvex-shipper-pallet.webp',
    titleKey: 'roles.shipper.cardTitle',
    roleTagKey: 'roles.shipper.cardRoleTag',
    descriptionKey: 'roles.shipper.cardDescription',
  },
] as const;
