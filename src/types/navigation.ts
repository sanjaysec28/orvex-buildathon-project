import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './domain';

export interface NavItemConfig {
  id: string;
  path: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface RoleWorkspaceConfig {
  role: UserRole;
  basePath: string;
  titleKey: string;
  navItems: NavItemConfig[];
}
