import assert from 'node:assert/strict';
import test from 'node:test';
import type { ShipperRegistrationDraft } from './shipperTypes.ts';
import {
  getShipperDocumentRequirements,
  isValidMobileOrEmailIdentifier,
  validateShipperBusinessDetails,
  validateShipperSubmittedPayload,
  validateShippingProfileStep,
} from './shipperValidation.ts';

function buildValidIndividualDraft(): ShipperRegistrationDraft {
  return {
    draftId: 'shp_draft_123456',
    currentStep: 6,
    account: {
      fullName: 'Meera Nair',
      mobileNumber: '9876543210',
      email: 'meera@orvextraders.in',
      termsAccepted: true,
    },
    businessType: 'individual',
    individualDetails: {
      businessShopName: 'ORVEX Traders',
      ownerFullName: 'Meera Nair',
      businessCategory: 'Wholesale & Trading',
      panNumber: '',
      gstin: '',
      businessAddress: '125 Mount Road, Guindy',
      state: 'Tamil Nadu',
      city: 'Chennai',
      pinCode: '600032',
    },
    companyDetails: {
      legalCompanyName: '',
      tradeName: '',
      constitution: 'Private Limited',
      companyPan: '',
      gstin: '',
      businessCategory: 'Manufacturing',
      businessWebsite: '',
      registeredAddress: '',
      state: '',
      city: '',
      pinCode: '',
      representativeName: '',
      representativeDesignation: '',
      representativeMobile: '',
      representativeEmail: '',
    },
    shippingProfile: {
      mainGoodsCategory: 'General Goods',
      typicalCargo: ['Cartons & Pallets'],
      averageWeightValue: '5',
      averageWeightUnit: 'Tonnes',
      preferredVehicleTypes: ['17 ft'],
      primaryPickupLocation: 'Chennai',
      regularDeliveryLocations: ['Bengaluru', 'Hyderabad'],
      shipmentFrequency: 'Weekly',
    },
    documents: {
      identityProof: {
        documentId: 'doc_id_01',
        slotKey: 'identityProof',
        fileName: 'voter.png',
        mimeType: 'image/png',
        sizeBytes: 2048,
        uploadedAt: new Date().toISOString(),
        status: 'Uploaded',
        storageScope: 'private-server-vault',
      },
      addressProof: {
        documentId: 'doc_addr_01',
        slotKey: 'addressProof',
        fileName: 'bill.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 4096,
        uploadedAt: new Date().toISOString(),
        status: 'Uploaded',
        storageScope: 'private-server-vault',
      },
    },
    identityProofType: 'Voter ID',
    addressProofType: 'Utility Bill',
    declarationConfirmed: true,
    updatedAt: new Date().toISOString(),
  };
}

test('isValidMobileOrEmailIdentifier validates Indian mobile numbers and email addresses cleanly', () => {
  assert.equal(isValidMobileOrEmailIdentifier('9876543210'), true);
  assert.equal(isValidMobileOrEmailIdentifier('+91 9876543210'), true);
  assert.equal(isValidMobileOrEmailIdentifier('ops@company.co.in'), true);
  assert.equal(isValidMobileOrEmailIdentifier('12345'), false);
  assert.equal(isValidMobileOrEmailIdentifier('bad@'), false);
});

test('Business type must be explicitly chosen and conditional fields isolate Individual vs Company', () => {
  const draft = buildValidIndividualDraft();
  draft.businessType = null;
  const noTypeErrs = validateShipperBusinessDetails(draft);
  assert.ok(noTypeErrs.businessType);

  draft.businessType = 'company';
  const companyErrs = validateShipperBusinessDetails(draft);
  assert.ok(companyErrs.legalCompanyName);
  assert.ok(companyErrs.companyPan);
  assert.ok(companyErrs.representativeName);
});

test('Shipping profile requires goods category, cargo, weight > 0, vehicle type, pickup, and delivery location', () => {
  const draft = buildValidIndividualDraft();
  draft.shippingProfile.preferredVehicleTypes = [];
  draft.shippingProfile.averageWeightValue = '0';
  draft.shippingProfile.regularDeliveryLocations = [];

  const errs = validateShippingProfileStep(draft);
  assert.ok(errs.preferredVehicleTypes);
  assert.ok(errs.averageWeightValue);
  assert.ok(errs.regularDeliveryLocations);
});

test('Conditional shipper documents adjust when GSTIN or company constitution changes', () => {
  const indNoPanNoGst = getShipperDocumentRequirements('individual', 'Proprietorship', '', '');
  assert.equal(indNoPanNoGst.find((r) => r.slotKey === 'panCard')?.required, false);
  assert.equal(indNoPanNoGst.find((r) => r.slotKey === 'gstCertificate')?.required, false);
  assert.equal(indNoPanNoGst.find((r) => r.slotKey === 'constitutionProof'), undefined);

  const indWithPanGst = getShipperDocumentRequirements(
    'individual',
    'Proprietorship',
    'ABCDE1234F',
    '33ABCDE1234F1Z5',
  );
  assert.equal(indWithPanGst.find((r) => r.slotKey === 'panCard')?.required, true);
  assert.equal(indWithPanGst.find((r) => r.slotKey === 'gstCertificate')?.required, true);

  const companyPvt = getShipperDocumentRequirements('company', 'Private Limited', '', '');
  assert.equal(companyPvt.find((r) => r.slotKey === 'panCard')?.required, true);
  assert.equal(companyPvt.find((r) => r.slotKey === 'constitutionProof')?.required, true);
  assert.equal(companyPvt.find((r) => r.slotKey === 'authorisationDoc')?.required, true);
});

test('Full shipper submitted payload passes when valid and fails when declaration missing', () => {
  const draft = buildValidIndividualDraft();
  assert.deepEqual(validateShipperSubmittedPayload(draft), {});

  draft.declarationConfirmed = false;
  const errs = validateShipperSubmittedPayload(draft);
  assert.ok(errs.declarationConfirmed);
});
