import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UserRole } from '../types/domain';

const ROLE_STORAGE_KEY = 'orvex.role.preview';

interface RoleContextValue {
  role: UserRole;
  setRole: (nextRole: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function readStoredRole(): UserRole {
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(ROLE_STORAGE_KEY) : null;
    return stored === 'shipper' ? 'shipper' : 'transporter';
  } catch {
    return 'transporter';
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(readStoredRole);

  const setRole = useCallback((nextRole: UserRole) => {
    setRoleState(nextRole);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleContext(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used inside RoleProvider');
  }
  return context;
}
