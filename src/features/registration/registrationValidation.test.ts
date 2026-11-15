import assert from 'node:assert/strict';
import test from 'node:test';
import type { TransporterRegistrationDraft } from './registrationTypes';
import {
  getDocumentRequirements,
  isAdultDob,
  isFutureDate,
  isValidDrivingLicence,
  isValidGstin,
  isValidPan,
  isValidPinCode,
  maskPan,
  validateDriversStep,
  validateOwnerDetailsStep,
  validateStep1Account,
} from './registrationValidation';

function buildBaseDraft(): TransporterRegistrationDraft {
  return {
    draftId: 'draft_test_123456',
    currentStep: 1,
    account: {
      fullName: 'Sanjay Kumar B',
      mobileNumber: '9876543210',
      email: 'sanjay@orvex.in',
      termsAccepted: true,
    },
    transporterType: 'individual',
    individualDetails: {
      legalFullName: 'Sanjay Kumar B',
      dateOfBirth: '1990-05-14',
      panNumber: 'ABCDE1234F',
      residentialAddress: '12 Anna Salai, Guindy',
      state: 'Tamil Nadu',
      city: 'Chennai',
      pinCode: '600032',
    },
    companyDetails: {
      legalBusinessName: 'Orvex Freight Pvt Ltd',
      tradeName: 'Orvex Logistics',
      constitution: 'Private Limited',
      companyPan: 'AABCO1234K',
      gstin: '33AABCO1234K1Z5',
      registeredAddress: '45 Outer Ring Road',
      state: 'Karnataka',
      city: 'Bengaluru',
      pinCode: '560037',
      representativeName: 'Arjun Nair',
      representativeDesignation: 'Director',
      representativeMobile: '9845012345',
      representativeEmail: 'arjun@orvex.in',
    },
    drivers: [
      {
        id: 'drv_1',
        isPrimary: true,
        fullName: 'Ramesh Kumar',
        mobileNumber: '9876501234',
        licenceNumber: 'TN0120200012345',
        licenceExpiryDate: '2030-01-01',
        licenceClass: 'HMV',
        address: '14 Koyambedu Market Road, Chennai',
        licenceDocument: null,
      },
    ],
    documents: {},
    identityProofType: 'Voter ID',
    addressProofType: 'Utility Bill',
    declarationConfirmed: false,
    updatedAt: new Date().toISOString(),
  };
}

test('Step 1 validation rejects mismatched passwords, invalid mobile, and unchecked terms', () => {
  const errs = validateStep1Account('S', '12345', 'bad-email', 'short', 'mismatch', false);
  assert.ok(errs.fullName);
  assert.ok(errs.mobileNumber);
  assert.ok(errs.email);
  assert.ok(errs.password);
  assert.ok(errs.confirmPassword);
  assert.ok(errs.termsAccepted);

  const ok = validateStep1Account('Sanjay Kumar', '9876543210', 'sanjay@orvex.in', 'StrongPass1', 'StrongPass1', true);
  assert.deepEqual(ok, {});
});

test('PAN, GSTIN, PIN, DOB, DL, and expiry validators work accurately', () => {
  assert.equal(isValidPan('ABCDE1234F'), true);
  assert.equal(isValidPan('1234567890'), false);
  assert.equal(isValidGstin('33AABCO1234K1Z5'), true);
  assert.equal(isValidGstin('INVALIDGST'), false);
  assert.equal(isValidPinCode('600032'), true);
  assert.equal(isValidPinCode('000123'), false);
  assert.equal(isAdultDob('1990-05-14', new Date('2026-11-15T00:00:00Z')), true);
  assert.equal(isAdultDob('2012-01-01', new Date('2026-11-15T00:00:00Z')), false);
  assert.equal(isFutureDate('2030-01-01', new Date('2026-11-15T00:00:00Z')), true);
  assert.equal(isFutureDate('2024-01-01', new Date('2026-11-15T00:00:00Z')), false);
  assert.equal(isValidDrivingLicence('TN0120200012345'), true);
  assert.equal(maskPan('ABCDE1234F'), 'ABCDE****F');
});

test('Owner details validation isolates Individual vs Company rules', () => {
  const indDraft = buildBaseDraft();
  assert.deepEqual(validateOwnerDetailsStep(indDraft), {});

  indDraft.transporterType = 'company';
  assert.deepEqual(validateOwnerDetailsStep(indDraft), {});

  indDraft.companyDetails.companyPan = 'BAD';
  const companyErrs = validateOwnerDetailsStep(indDraft);
  assert.ok(companyErrs.companyPan);
  assert.equal(companyErrs.dateOfBirth, undefined);
});

test('Drivers validation enforces exactly one primary driver and non-expired licence', () => {
  const draft = buildBaseDraft();
  assert.deepEqual(validateDriversStep(draft.drivers), {});

  draft.drivers[0].licenceExpiryDate = '2020-01-01';
  const expiredErr = validateDriversStep(draft.drivers);
  assert.ok(expiredErr.driver_0_licenceExpiryDate);
});

test('Conditional document requirements adapt between Individual Owner and Transport Company', () => {
  const indDocs = getDocumentRequirements('individual', 'Proprietorship', '');
  assert.equal(indDocs.length, 4);
  assert.ok(indDocs.every((d) => d.required));

  const propCoDocs = getDocumentRequirements('company', 'Proprietorship', '');
  const gstOpt = propCoDocs.find((d) => d.slotKey === 'gstCertificate');
  const authOpt = propCoDocs.find((d) => d.slotKey === 'authorisationDoc');
  assert.equal(gstOpt?.required, false);
  assert.equal(authOpt?.required, false);

  const pvtCoDocs = getDocumentRequirements('company', 'Private Limited', '33AABCO1234K1Z5');
  assert.equal(pvtCoDocs.find((d) => d.slotKey === 'gstCertificate')?.required, true);
  assert.equal(pvtCoDocs.find((d) => d.slotKey === 'authorisationDoc')?.required, true);
  assert.equal(pvtCoDocs.find((d) => d.slotKey === 'constitutionProof')?.required, true);
});
