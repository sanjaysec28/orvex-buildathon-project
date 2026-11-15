import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isValidIndianMobileNumber,
  isValidPassword,
  loginTransporterWithMobilePassword,
  normalizeIndianMobileNumber,
  requestTransporterWhatsAppOtp,
} from './transporterAuthService';

test('normalizeIndianMobileNumber validates and normalizes 10-digit Indian numbers', () => {
  assert.equal(normalizeIndianMobileNumber('9876543210'), '+919876543210');
  assert.equal(normalizeIndianMobileNumber('+91 98765 43210'), '+919876543210');
  assert.equal(normalizeIndianMobileNumber('09876543210'), '+919876543210');
  assert.equal(isValidIndianMobileNumber('5876543210'), false);
  assert.equal(isValidIndianMobileNumber('98765'), false);
});

test('isValidPassword enforces minimum length of 6 characters', () => {
  assert.equal(isValidPassword('12345'), false);
  assert.equal(isValidPassword('123456'), true);
});

test('loginTransporterWithMobilePassword fails cleanly without mocking success when provider is disconnected', async () => {
  const badMobile = await loginTransporterWithMobilePassword({
    mobileNumber: '12345',
    password: 'password123',
    role: 'transporter',
    rememberMe: true,
  });
  assert.equal(badMobile.ok, false);
  assert.equal(badMobile.errorCode, 'INVALID_MOBILE');

  const disconnected = await loginTransporterWithMobilePassword({
    mobileNumber: '9876543210',
    password: 'password123',
    role: 'transporter',
    rememberMe: true,
  });
  assert.equal(disconnected.ok, false);
  assert.equal(disconnected.errorCode, 'AUTH_NOT_CONFIGURED');
});

test('requestTransporterWhatsAppOtp reports unconfigured state instead of faking OTP success', async () => {
  const res = await requestTransporterWhatsAppOtp();
  assert.equal(res.ok, false);
  assert.equal(res.errorCode, 'WHATSAPP_OTP_NOT_CONFIGURED');
});
