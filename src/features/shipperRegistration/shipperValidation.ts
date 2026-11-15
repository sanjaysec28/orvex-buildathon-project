import type { BusinessConstitution } from '../registration/registrationTypes';
import {
  companyRequiresAuthorisation,
  companyRequiresConstitutionProof,
  isValidEmailAddress,
  isValidGstin,
  isValidIndianMobile,
  isValidPan,
  isValidPinCode,
  maskPan,
  normalizeIndianMobile,
  validateStep1Account,
} from '../registration/registrationValidation';
import type {
  ShipperBusinessType,
  ShipperDocumentSlotKey,
  ShipperRegistrationDraft,
} from './shipperTypes';

export {
  isValidEmailAddress,
  isValidGstin,
  isValidIndianMobile,
  isValidPan,
  isValidPinCode,
  maskPan,
  normalizeIndianMobile,
  validateStep1Account,
};

export interface ShipperDocumentRequirement {
  slotKey: ShipperDocumentSlotKey;
  title: string;
  subtitle: string;
  acceptedFormatsLabel: string;
  required: boolean;
  supportsSubType?: 'identity' | 'address';
}

export function isValidMobileOrEmailIdentifier(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (trimmed.includes('@')) {
    return isValidEmailAddress(trimmed);
  }
  return isValidIndianMobile(trimmed);
}

export function isValidOptionalWebsite(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export function getShipperDocumentRequirements(
  businessType: ShipperBusinessType | null,
  constitution: BusinessConstitution,
  individualPanNumber: string,
  gstin: string,
): ShipperDocumentRequirement[] {
  const hasGstin = gstin.trim().length > 0;

  if (businessType !== 'company') {
    const hasPan = individualPanNumber.trim().length > 0;
    return [
      {
        slotKey: 'panCard',
        title: 'PAN Card',
        subtitle: hasPan
          ? 'Required because PAN Number was provided'
          : 'Upload personal or proprietor PAN card (optional when PAN is blank)',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: hasPan,
      },
      {
        slotKey: 'identityProof',
        title: 'Identity Proof',
        subtitle: 'Voter ID, Passport, Driving Licence, or Aadhaar (Voluntary)',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: true,
        supportsSubType: 'identity',
      },
      {
        slotKey: 'addressProof',
        title: 'Business Address Proof',
        subtitle: 'Utility Bill / Rent Agreement / Bank Statement / Others',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: true,
        supportsSubType: 'address',
      },
      {
        slotKey: 'gstCertificate',
        title: 'GST Certificate',
        subtitle: hasGstin
          ? 'Required because GSTIN was entered'
          : 'Optional if unregistered under GST',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: hasGstin,
      },
    ];
  }

  return [
    {
      slotKey: 'panCard',
      title: 'Company PAN',
      subtitle: 'Entity PAN card issued to the registered business',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: true,
    },
    {
      slotKey: 'identityProof',
      title: 'Identity Proof of Authorised Representative',
      subtitle: 'Voter ID, Passport, Driving Licence, or Aadhaar (Voluntary)',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: true,
      supportsSubType: 'identity',
    },
    {
      slotKey: 'addressProof',
      title: 'Business Address Proof',
      subtitle: 'Utility Bill / Rent Agreement / Registered Premises Proof',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: true,
      supportsSubType: 'address',
    },
    {
      slotKey: 'constitutionProof',
      title: 'Business Constitution Proof',
      subtitle: companyRequiresConstitutionProof(constitution)
        ? `Incorporation / Partnership Deed / LLP proof (${constitution})`
        : 'Optional for Proprietorship (Shop Act / MSME Udyam if available)',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: companyRequiresConstitutionProof(constitution),
    },
    {
      slotKey: 'gstCertificate',
      title: 'GST Certificate',
      subtitle: hasGstin
        ? 'Required because GSTIN was entered'
        : 'Optional if unregistered under GST',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: hasGstin,
    },
    {
      slotKey: 'authorisationDoc',
      title: 'Authorisation Document',
      subtitle: companyRequiresAuthorisation(constitution)
        ? 'Board Resolution or Authorisation Letter for representative'
        : 'Optional unless represented by an authorised signatory',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: companyRequiresAuthorisation(constitution),
    },
  ];
}

export function validateShipperBusinessDetails(
  draft: ShipperRegistrationDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!draft.businessType) {
    errors.businessType = 'Please choose your business type before continuing.';
    return errors;
  }

  if (draft.businessType === 'individual') {
    const ind = draft.individualDetails;
    if (ind.businessShopName.trim().length < 2) {
      errors.businessShopName = 'Enter your business or shop name.';
    }
    if (ind.ownerFullName.trim().length < 2) {
      errors.ownerFullName = "Enter the owner's full name.";
    }
    if (!ind.businessCategory) {
      errors.businessCategory = 'Select a business category.';
    }
    if (ind.panNumber.trim().length > 0 && !isValidPan(ind.panNumber)) {
      errors.panNumber = 'Enter a valid 10-character PAN (e.g., ABCDE1234F) or leave blank.';
    }
    if (ind.gstin.trim().length > 0 && !isValidGstin(ind.gstin)) {
      errors.gstin = 'Enter a valid 15-character GSTIN or leave blank.';
    }
    if (ind.businessAddress.trim().length < 6) {
      errors.businessAddress = 'Enter complete business / shop address.';
    }
    if (!ind.state.trim()) {
      errors.state = 'Select your state or union territory.';
    }
    if (!ind.city.trim()) {
      errors.city = 'Select or enter your city / district.';
    }
    if (!isValidPinCode(ind.pinCode)) {
      errors.pinCode = 'Enter a valid 6-digit Indian PIN code.';
    }
    return errors;
  }

  const co = draft.companyDetails;
  if (co.legalCompanyName.trim().length < 2) {
    errors.legalCompanyName = 'Enter legal registered company name.';
  }
  if (!co.constitution) {
    errors.constitution = 'Select business constitution.';
  }
  if (!isValidPan(co.companyPan)) {
    errors.companyPan = 'Enter a valid 10-character Company PAN.';
  }
  if (co.gstin.trim().length > 0 && !isValidGstin(co.gstin)) {
    errors.gstin = 'Enter a valid 15-character GSTIN or leave blank.';
  }
  if (!co.businessCategory) {
    errors.businessCategory = 'Select business category.';
  }
  if (!isValidOptionalWebsite(co.businessWebsite)) {
    errors.businessWebsite = 'Enter a valid website URL (e.g., https://company.in) or leave blank.';
  }
  if (co.registeredAddress.trim().length < 6) {
    errors.registeredAddress = 'Enter registered business address.';
  }
  if (!co.state.trim()) {
    errors.state = 'Select registered state or union territory.';
  }
  if (!co.city.trim()) {
    errors.city = 'Select or enter city / district.';
  }
  if (!isValidPinCode(co.pinCode)) {
    errors.pinCode = 'Enter a valid 6-digit PIN code.';
  }
  if (co.representativeName.trim().length < 2) {
    errors.representativeName = 'Enter authorised representative name.';
  }
  if (co.representativeDesignation.trim().length < 2) {
    errors.representativeDesignation = 'Enter representative designation.';
  }
  if (!isValidIndianMobile(co.representativeMobile)) {
    errors.representativeMobile = 'Enter valid 10-digit Indian mobile number.';
  }
  if (!isValidEmailAddress(co.representativeEmail)) {
    errors.representativeEmail = 'Enter valid representative email address.';
  }
  return errors;
}

export function validateShippingProfileStep(
  draft: ShipperRegistrationDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const sp = draft.shippingProfile;

  if (!sp.mainGoodsCategory) {
    errors.mainGoodsCategory = 'Select a main goods category.';
  }
  if (sp.typicalCargo.length === 0) {
    errors.typicalCargo = 'Select or add at least one typical cargo type.';
  }
  const weightNum = Number(sp.averageWeightValue);
  if (!sp.averageWeightValue.trim() || !Number.isFinite(weightNum) || weightNum <= 0) {
    errors.averageWeightValue = 'Enter a valid average shipment weight greater than 0.';
  }
  if (sp.preferredVehicleTypes.length === 0) {
    errors.preferredVehicleTypes = 'Select at least one preferred vehicle type.';
  }
  if (sp.primaryPickupLocation.trim().length < 2) {
    errors.primaryPickupLocation = 'Enter or select your primary pickup location.';
  }
  if (sp.regularDeliveryLocations.length === 0) {
    errors.regularDeliveryLocations = 'Add at least one regular delivery location.';
  }
  if (!sp.shipmentFrequency) {
    errors.shipmentFrequency = 'Select expected shipment frequency.';
  }
  return errors;
}

export function validateShipperDocumentsStep(
  draft: ShipperRegistrationDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const gstin =
    draft.businessType === 'company' ? draft.companyDetails.gstin : draft.individualDetails.gstin;
  const reqs = getShipperDocumentRequirements(
    draft.businessType,
    draft.companyDetails.constitution,
    draft.individualDetails.panNumber,
    gstin,
  );

  for (const req of reqs) {
    if (!req.required) continue;
    const doc = draft.documents[req.slotKey];
    if (!doc || doc.status !== 'Uploaded') {
      errors[req.slotKey] = `${req.title} upload is required.`;
    }
  }
  return errors;
}

export function validateShipperSubmittedPayload(
  draft: ShipperRegistrationDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (draft.account.fullName.trim().length < 2) {
    errors.fullName = 'Account full name is required.';
  }
  if (!isValidIndianMobile(draft.account.mobileNumber)) {
    errors.mobileNumber = 'Valid Indian mobile number is required.';
  }
  if (!isValidEmailAddress(draft.account.email)) {
    errors.email = 'Valid email address is required.';
  }
  if (!draft.account.termsAccepted) {
    errors.termsAccepted = 'Terms agreement is required.';
  }
  if (!draft.businessType) {
    errors.businessType = 'Business type selection is required.';
  }

  Object.assign(errors, validateShipperBusinessDetails(draft));
  Object.assign(errors, validateShippingProfileStep(draft));
  Object.assign(errors, validateShipperDocumentsStep(draft));

  if (!draft.declarationConfirmed) {
    errors.declarationConfirmed =
      'Please confirm that the provided information is true and correct.';
  }
  return errors;
}
