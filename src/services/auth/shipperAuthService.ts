import type { UserRole } from '../../types/domain';
import {
  isValidEmailAddress,
  isValidIndianMobile,
  isValidMobileOrEmailIdentifier,
} from '../../features/shipperRegistration/shipperValidation';
import { firebaseAuthContract, type AuthSession } from './authContract';
import { requestRegistrationOtp } from '../registration/transporterRegistrationService';

const SHIPPER_REMEMBER_ME_KEY = 'orvex.shipper.auth.rememberMe';

export type ShipperAuthErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'INVALID_PASSWORD'
  | 'INVALID_CREDENTIALS'
  | 'ROLE_MISMATCH'
  | 'NETWORK_ERROR'
  | 'AUTH_NOT_CONFIGURED'
  | 'OTP_NOT_CONFIGURED';

export interface ShipperAuthResult {
  ok: boolean;
  session?: AuthSession;
  errorCode?: ShipperAuthErrorCode;
  message?: string;
}

export function readShipperRememberMePreference(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(SHIPPER_REMEMBER_ME_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function persistShipperRememberMePreference(rememberMe: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SHIPPER_REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export interface ShipperCredentialLoginRequest {
  identifier: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
}

export async function loginShipperWithCredential(
  request: ShipperCredentialLoginRequest,
): Promise<ShipperAuthResult> {
  const trimmedIdentifier = request.identifier.trim();
  if (!isValidMobileOrEmailIdentifier(trimmedIdentifier)) {
    return {
      ok: false,
      errorCode: 'INVALID_IDENTIFIER',
      message: 'Enter a valid 10-digit Indian mobile number or email address.',
    };
  }

  if (request.password.length < 6) {
    return {
      ok: false,
      errorCode: 'INVALID_PASSWORD',
      message: 'Password must be at least 6 characters.',
    };
  }

  // Strictly block non-shipper login attempts on Shipper Login
  if (request.role !== 'shipper') {
    return {
      ok: false,
      errorCode: 'ROLE_MISMATCH',
      message: 'Only verified Shipper accounts can sign in here.',
    };
  }

  persistShipperRememberMePreference(request.rememberMe);

  if (!firebaseAuthContract.isConnected) {
    return {
      ok: false,
      errorCode: 'AUTH_NOT_CONFIGURED',
      message:
        'Authentication service is not connected yet. Connect Firebase Authentication before signing in.',
    };
  }

  const session = firebaseAuthContract.getCurrentSession();
  if (!session) {
    return {
      ok: false,
      errorCode: 'INVALID_CREDENTIALS',
      message: 'Invalid mobile number/email or password.',
    };
  }

  if (session.role !== 'shipper') {
    return {
      ok: false,
      errorCode: 'ROLE_MISMATCH',
      message: 'This account belongs to another role and cannot enter the Shipper dashboard.',
    };
  }

  return { ok: true, session };
}

export async function requestShipperOtpLogin(mobileOrEmail?: string): Promise<ShipperAuthResult> {
  const trimmed = (mobileOrEmail ?? '').trim();
  if (trimmed && !isValidIndianMobile(trimmed) && !isValidEmailAddress(trimmed)) {
    return {
      ok: false,
      errorCode: 'INVALID_IDENTIFIER',
      message: 'Enter a valid 10-digit Indian mobile number to receive an OTP.',
    };
  }

  if (trimmed && isValidEmailAddress(trimmed) && !isValidIndianMobile(trimmed)) {
    return {
      ok: false,
      errorCode: 'OTP_NOT_CONFIGURED',
      message:
        'OTP login uses mobile SMS verification and is not configured yet in this environment. Connect Firebase Authentication to enable OTP login.',
    };
  }

  const response = await requestRegistrationOtp(trimmed || '9000000000');
  if (response.ok && response.configured) {
    return { ok: true };
  }

  return {
    ok: false,
    errorCode: 'OTP_NOT_CONFIGURED',
    message:
      'OTP login service is not configured yet in this environment. Connect Firebase Authentication to enable SMS OTP sign-in.',
  };
}
