export function isDemoModeEnabledOnServer(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const nodeEnv = (env.NODE_ENV ?? '').trim().toLowerCase();
  if (nodeEnv === 'production') {
    return false;
  }
  const explicit = (env.ORVEX_DEMO_MODE ?? '').trim().toLowerCase();
  if (explicit === 'false' || explicit === '0' || explicit === 'off') {
    return false;
  }
  return true;
}

export const DEMO_TRANSPORTER_UID = 'demo_transporter_orvex';
export const DEMO_SHIPPER_UID = 'demo_shipper_orvex';

export function isReservedDemoUid(uid: string | undefined | null): boolean {
  return uid === DEMO_TRANSPORTER_UID || uid === DEMO_SHIPPER_UID;
}

export interface SessionCookieRequestLike {
  secure?: boolean;
  headers: Record<string, string | string[] | undefined>;
}

export interface SessionCookieOptions {
  httpOnly: true;
  sameSite: 'lax' | 'none';
  secure: boolean;
  partitioned?: boolean;
  path: '/';
  maxAge?: number;
}

function readSingleHeader(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

export function resolveSessionCookieOptions(
  req: SessionCookieRequestLike,
  maxAgeMs?: number,
): SessionCookieOptions {
  const forwardedProto = readSingleHeader(req.headers['x-forwarded-proto'])
    .split(',')[0]
    .trim()
    .toLowerCase();
  const origin = readSingleHeader(req.headers.origin).trim().toLowerCase();
  const referer = readSingleHeader(req.headers.referer).trim().toLowerCase();

  const isHttps =
    Boolean(req.secure) ||
    forwardedProto === 'https' ||
    origin.startsWith('https://') ||
    referer.startsWith('https://');

  if (isHttps) {
    return {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      partitioned: true,
      path: '/',
      ...(typeof maxAgeMs === 'number' ? { maxAge: maxAgeMs } : {}),
    };
  }

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    ...(typeof maxAgeMs === 'number' ? { maxAge: maxAgeMs } : {}),
  };
}
