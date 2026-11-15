import type { UserRole } from '../types/domain';

export function getWorkspaceBasePath(role: UserRole): string {
  return role === 'transporter' ? '/transporter' : '/shipper';
}

export function resolveRoleFromPath(pathname: string): UserRole | null {
  if (pathname === '/transporter' || pathname.startsWith('/transporter/')) {
    return 'transporter';
  }
  if (pathname === '/shipper' || pathname.startsWith('/shipper/')) {
    return 'shipper';
  }
  return null;
}

export function getOppositeRole(role: UserRole): UserRole {
  return role === 'transporter' ? 'shipper' : 'transporter';
}

export function isValidRole(value: unknown): value is UserRole {
  return value === 'transporter' || value === 'shipper';
}

export function getRoleAuthPath(role: UserRole): string {
  return `/auth?role=${role}`;
}

export function isRouteInRoleWorkspace(pathname: string, role: UserRole): boolean {
  return resolveRoleFromPath(pathname) === role;
}
