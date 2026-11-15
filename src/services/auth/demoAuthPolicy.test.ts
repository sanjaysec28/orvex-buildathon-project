import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEMO_SHIPPER_UID,
  DEMO_TRANSPORTER_UID,
  isDemoModeEnabledOnServer,
  isReservedDemoUid,
  resolveSessionCookieOptions,
} from './demoAuthPolicy.ts';

test('isDemoModeEnabledOnServer always disables demo mode when NODE_ENV=production', () => {
  assert.equal(isDemoModeEnabledOnServer({ NODE_ENV: 'production' }), false);
  assert.equal(
    isDemoModeEnabledOnServer({ NODE_ENV: 'production', ORVEX_DEMO_MODE: 'true' }),
    false,
  );
});

test('isDemoModeEnabledOnServer allows demo mode in development unless explicitly disabled', () => {
  assert.equal(isDemoModeEnabledOnServer({ NODE_ENV: 'development' }), true);
  assert.equal(isDemoModeEnabledOnServer({}), true);
  assert.equal(isDemoModeEnabledOnServer({ NODE_ENV: 'development', ORVEX_DEMO_MODE: 'false' }), false);
});

test('isReservedDemoUid identifies only demo accounts', () => {
  assert.equal(isReservedDemoUid(DEMO_TRANSPORTER_UID), true);
  assert.equal(isReservedDemoUid(DEMO_SHIPPER_UID), true);
  assert.equal(isReservedDemoUid('tr_real_12345'), false);
});

test('resolveSessionCookieOptions uses SameSite=None; Secure; Partitioned for HTTPS and SameSite=Lax for plain HTTP', () => {
  const httpsProxy = resolveSessionCookieOptions(
    { secure: false, headers: { 'x-forwarded-proto': 'https', host: 'ais-dev.run.app' } },
    1000,
  );
  assert.deepEqual(httpsProxy, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    partitioned: true,
    path: '/',
    maxAge: 1000,
  });

  const httpsOrigin = resolveSessionCookieOptions({
    secure: false,
    headers: { origin: 'https://ais-dev.run.app' },
  });
  assert.equal(httpsOrigin.sameSite, 'none');
  assert.equal(httpsOrigin.secure, true);
  assert.equal(httpsOrigin.partitioned, true);

  const plainHttp = resolveSessionCookieOptions(
    { secure: false, headers: { host: 'localhost:3000', 'sec-fetch-site': 'same-origin' } },
    1000,
  );
  assert.deepEqual(plainHttp, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 1000,
  });
});
