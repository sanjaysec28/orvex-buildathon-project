import type { UserRole } from '../../types/domain';
import { firebaseAuthContract, type AuthSession } from './authContract';

const REMEMBER_ME_STORAGE_KEY = 'orvex.auth.rememberMe';

export type TransporterAuthErrorCode =
  | 'INVALID_MOBILE'
  | 'INVALID_PASSWORD'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_DISABLED'
  | 'NETWORK_ERROR'
  | 'AUTH_NOT_CONFIGURED'
  | 'WHATSAPP_OTP_NOT_CONFIGURED';

export interface TransporterAuthResult {
  ok: boolean;
  session?: AuthSession;
  errorCode?: TransporterAuthErrorCode;
}

export function normalizeIndianMobileNumber(rawInput: string): string | null {
  const cleaned = rawInput.replace(/[\s()-]/g, '');
  let tenDigits = cleaned;

  if (cleaned.startsWith('+91')) {
    tenDigits = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigits = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    tenDigits = cleaned.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(tenDigits)) {
    return null;
  }

  return `+91${tenDigits}`;
}

export function isValidIndianMobileNumber(rawInput: string): boolean {
  return normalizeIndianMobileNumber(rawInput) !== null;
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function readRememberMePreference(): boolean {
  try {
    if (typeof window === 'undefined') {
      return true;
    }
    const stored = window.localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (stored === 'false') {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export function persistRememberMePreference(rememberMe: boolean): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(REMEMBER_ME_STORAGE_KEY, rememberMe ? 'true' : 'false');
  } catch {
    // Ignore storage quota / privacy errors
  }
}

export interface MobilePasswordLoginRequest {
  mobileNumber: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
}

export async function loginTransporterWithMobilePassword(
  request: MobilePasswordLoginRequest,
): Promise<TransporterAuthResult> {
  const normalizedPhone = normalizeIndianMobileNumber(request.mobileNumber);
  if (!normalizedPhone) {
    return { ok: false, errorCode: 'INVALID_MOBILE' };
  }

  if (!isValidPassword(request.password)) {
    return { ok: false, errorCode: 'INVALID_PASSWORD' };
  }

  if (request.role !== 'transporter') {
    return { ok: false, errorCode: 'INVALID_CREDENTIALS' };
  }

  persistRememberMePreference(request.rememberMe);

  if (!firebaseAuthContract.isConnected) {
    return { ok: false, errorCode: 'AUTH_NOT_CONFIGURED' };
  }

  const session = firebaseAuthContract.getCurrentSession();
  if (!session) {
    return { ok: false, errorCode: 'INVALID_CREDENTIALS' };
  }

  return { ok: true, session };
}

export async function requestTransporterWhatsAppOtp(): Promise<TransporterAuthResult> {
  if (!firebaseAuthContract.isConnected) {
    return { ok: false, errorCode: 'WHATSAPP_OTP_NOT_CONFIGURED' };
  }
  return { ok: false, errorCode: 'WHATSAPP_OTP_NOT_CONFIGURED' };
}
