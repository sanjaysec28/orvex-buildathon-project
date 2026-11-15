import type { UserRole } from '../../types/domain';

export interface AuthSession {
  uid: string;
  phoneNumber: string | null;
  role: UserRole;
  preferredLanguage: string;
}

export interface AuthProviderContract {
  readonly provider: 'firebase-authentication';
  readonly isConnected: false;
  getCurrentSession(): AuthSession | null;
}

export const firebaseAuthContract: AuthProviderContract = {
  provider: 'firebase-authentication',
  isConnected: false,
  getCurrentSession() {
    return null;
  },
};
