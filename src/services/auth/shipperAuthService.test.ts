import assert from 'node:assert/strict';
import test from 'node:test';
import { loginShipperWithCredential } from './shipperAuthService.ts';

test('loginShipperWithCredential rejects invalid identifiers and short passwords', async () => {
  const badId = await loginShipperWithCredential({
    identifier: '1234',
    password: 'password123',
    role: 'shipper',
    rememberMe: true,
  });
  assert.equal(badId.ok, false);
  assert.equal(badId.errorCode, 'INVALID_IDENTIFIER');

  const shortPwd = await loginShipperWithCredential({
    identifier: 'shipper@orvex.in',
    password: '123',
    role: 'shipper',
    rememberMe: true,
  });
  assert.equal(shortPwd.ok, false);
  assert.equal(shortPwd.errorCode, 'INVALID_PASSWORD');
});

test('loginShipperWithCredential blocks transporter role from entering shipper dashboard', async () => {
  const mismatch = await loginShipperWithCredential({
    identifier: '9876543210',
    password: 'OrvexPassword1',
    role: 'transporter',
    rememberMe: true,
  });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.errorCode, 'ROLE_MISMATCH');
});

test('loginShipperWithCredential fails honestly when Firebase Authentication is disconnected', async () => {
  const res = await loginShipperWithCredential({
    identifier: '9876543210',
    password: 'OrvexPassword1',
    role: 'shipper',
    rememberMe: false,
  });
  assert.equal(res.ok, false);
  assert.equal(res.errorCode, 'AUTH_NOT_CONFIGURED');
});
