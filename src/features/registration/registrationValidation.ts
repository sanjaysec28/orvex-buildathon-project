import type {
  BusinessConstitution,
  DocumentSlotKey,
  DriverRecord,
  TransporterRegistrationDraft,
  TransporterType,
} from './registrationTypes';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;

export function normalizeIndianMobile(rawInput: string): string | null {
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

  return `+91 ${tenDigits}`;
}

export function isValidIndianMobile(rawInput: string): boolean {
  return normalizeIndianMobile(rawInput) !== null;
}

export function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidPan(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());
}

export function isValidGstin(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
    gstin.trim().toUpperCase(),
  );
}

export function isValidPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

export function isValidDrivingLicence(licenceNumber: string): boolean {
  const normalized = licenceNumber.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{7,13}$/.test(normalized);
}

export function isAdultDob(dobStr: string, referenceDate: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
    return false;
  }
  const dob = new Date(`${dobStr}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) {
    return false;
  }
  const cutoff = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear() - 18,
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  return dob <= cutoff;
}

export function isFutureDate(dateStr: string, referenceDate: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const target = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) {
    return false;
  }
  const todayUtc = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  return target > todayUtc;
}

export function maskPan(pan: string): string {
  const normalized = pan.trim().toUpperCase();
  if (normalized.length < 10) return '****';
  return `${normalized.slice(0, 5)}****${normalized.slice(-1)}`;
}

export function maskLicence(dl: string): string {
  const normalized = dl.trim().toUpperCase();
  if (normalized.length < 6) return '****';
  return `${normalized.slice(0, 4)}****${normalized.slice(-4)}`;
}

export interface DocumentRequirementDescriptor {
  slotKey: DocumentSlotKey;
  title: string;
  subtitle: string;
  acceptedFormatsLabel: string;
  required: boolean;
  supportsSubType?: 'identity' | 'address';
}

export function companyRequiresAuthorisation(constitution: BusinessConstitution): boolean {
  return constitution !== 'Proprietorship';
}

export function companyRequiresConstitutionProof(constitution: BusinessConstitution): boolean {
  return constitution !== 'Proprietorship';
}

export function getDocumentRequirements(
  transporterType: TransporterType,
  constitution: BusinessConstitution,
  gstin: string,
): DocumentRequirementDescriptor[] {
  if (transporterType === 'individual') {
    return [
      {
        slotKey: 'panCard',
        title: 'PAN Card',
        subtitle: 'Clear scan or photo of your personal PAN card',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: true,
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
        title: 'Address Proof',
        subtitle: 'Utility Bill / Rent Agreement / Bank Statement / Others',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: true,
        supportsSubType: 'address',
      },
      {
        slotKey: 'driverLicence',
        title: 'Driving Licence',
        subtitle: 'Primary Driver active commercial / LMV driving licence',
        acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
        required: true,
      },
    ];
  }

  const hasGstin = gstin.trim().length > 0;
  return [
    {
      slotKey: 'panCard',
      title: 'Company PAN',
      subtitle: 'Entity PAN card issued to the transport business',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: true,
    },
    {
      slotKey: 'identityProof',
      title: 'Authorised Representative Identity Proof',
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
        ? 'Required because GSTIN is entered'
        : 'Optional if unregistered under GST',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: hasGstin,
    },
    {
      slotKey: 'authorisationDoc',
      title: 'Authorisation Proof',
      subtitle: companyRequiresAuthorisation(constitution)
        ? 'Board Resolution or Authorisation Letter for representative'
        : 'Optional unless represented by an authorised signatory',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: companyRequiresAuthorisation(constitution),
    },
    {
      slotKey: 'driverLicence',
      title: 'Driving Licence',
      subtitle: 'Primary Driver active driving licence',
      acceptedFormatsLabel: 'JPG, PNG or PDF (Max 5 MB)',
      required: true,
    },
  ];
}

export function validateStep1Account(
  fullName: string,
  mobileNumber: string,
  email: string,
  password: string,
  confirmPassword: string,
  termsAccepted: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (minimum 2 characters).';
  }
  if (!isValidIndianMobile(mobileNumber)) {
    errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number (starting with 6–9).';
  }
  if (!isValidEmailAddress(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (confirmPassword !== password || confirmPassword.length === 0) {
    errors.confirmPassword = 'Passwords must match.';
  }
  if (!termsAccepted) {
    errors.termsAccepted = 'Please agree to the Terms of Service and Privacy Policy.';
  }

  return errors;
}

export function validateOwnerDetailsStep(draft: TransporterRegistrationDraft): Record<string, string> {
  const errors: Record<string, string> = {};

  if (draft.transporterType === 'individual') {
    const ind = draft.individualDetails;
    if (ind.legalFullName.trim().length < 2) {
      errors.legalFullName = 'Enter legal full name as per PAN.';
    }
    if (!isAdultDob(ind.dateOfBirth)) {
      errors.dateOfBirth = 'Applicant must be at least 18 years old.';
    }
    if (!isValidPan(ind.panNumber)) {
      errors.panNumber = 'Enter a valid 10-character PAN (e.g., ABCDE1234F).';
    }
    if (ind.residentialAddress.trim().length < 6) {
      errors.residentialAddress = 'Enter complete residential address.';
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
  if (co.legalBusinessName.trim().length < 2) {
    errors.legalBusinessName = 'Enter registered legal business name.';
  }
  if (!co.constitution) {
    errors.constitution = 'Select business constitution.';
  }
  if (!isValidPan(co.companyPan)) {
    errors.companyPan = 'Enter a valid 10-character Company PAN.';
  }
  if (co.gstin.trim().length > 0 && !isValidGstin(co.gstin)) {
    errors.gstin = 'Enter a valid 15-character GSTIN (or leave blank if not registered).';
  }
  if (co.registeredAddress.trim().length < 6) {
    errors.registeredAddress = 'Enter registered office address.';
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
    errors.representativeName = 'Enter authorised representative full name.';
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

export function validateDriverRecord(driver: DriverRecord, index: number): Record<string, string> {
  const prefix = `driver_${index}_`;
  const errors: Record<string, string> = {};

  if (driver.fullName.trim().length < 2) {
    errors[`${prefix}fullName`] = 'Enter driver full name.';
  }
  if (!isValidIndianMobile(driver.mobileNumber)) {
    errors[`${prefix}mobileNumber`] = 'Enter valid 10-digit Indian mobile number.';
  }
  if (!isValidDrivingLicence(driver.licenceNumber)) {
    errors[`${prefix}licenceNumber`] = 'Enter valid Indian driving licence number (e.g., TN0120200012345).';
  }
  if (!isFutureDate(driver.licenceExpiryDate)) {
    errors[`${prefix}licenceExpiryDate`] = 'Driving licence must not be expired.';
  }
  if (!driver.licenceClass) {
    errors[`${prefix}licenceClass`] = 'Select licence class.';
  }
  if (driver.address.trim().length < 6) {
    errors[`${prefix}address`] = 'Enter driver address.';
  }
  return errors;
}

export function validateDriversStep(drivers: DriverRecord[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const primaryCount = drivers.filter((d) => d.isPrimary).length;
  if (primaryCount !== 1) {
    errors.primaryDriver = 'Exactly one primary driver is required.';
  }
  drivers.forEach((driver, index) => {
    Object.assign(errors, validateDriverRecord(driver, index));
  });
  return errors;
}

export function validateDocumentsStep(draft: TransporterRegistrationDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const reqs = getDocumentRequirements(
    draft.transporterType,
    draft.companyDetails.constitution,
    draft.companyDetails.gstin,
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

export function validateSubmittedApplicationPayload(
  draft: TransporterRegistrationDraft,
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
  Object.assign(errors, validateOwnerDetailsStep(draft));
  Object.assign(errors, validateDriversStep(draft.drivers));
  Object.assign(errors, validateDocumentsStep(draft));

  if (!draft.declarationConfirmed) {
    errors.declarationConfirmed = 'Please confirm that the provided information is true and correct.';
  }
  return errors;
}
