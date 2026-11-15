export type TransporterType = 'individual' | 'company';

export type BusinessConstitution =
  | 'Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited'
  | 'Public Limited'
  | 'Other';

export type VerificationStatus =
  | 'Draft'
  | 'Under Verification'
  | 'Action Required'
  | 'Verified'
  | 'Rejected';

export type IdentityProofType =
  | 'Voter ID'
  | 'Passport'
  | 'Driving Licence'
  | 'Aadhaar (Voluntary)';

export type AddressProofType =
  | 'Utility Bill'
  | 'Rent Agreement'
  | 'Bank Statement'
  | 'Others';

export type LicenceClassType =
  | 'LMV'
  | 'LMV-TR'
  | 'MGV'
  | 'HMV'
  | 'HGV'
  | 'Trans (Transport Vehicle)';

export type DocumentSlotKey =
  | 'profilePhoto'
  | 'authorisationDoc'
  | 'panCard'
  | 'identityProof'
  | 'addressProof'
  | 'constitutionProof'
  | 'gstCertificate'
  | 'driverLicence';

export interface UploadedDocumentMeta {
  documentId: string;
  slotKey: DocumentSlotKey;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  status: 'Uploaded';
  storageScope: 'private-server-vault';
  proofSubType?: string;
}

export interface AccountDraftData {
  fullName: string;
  mobileNumber: string;
  email: string;
  termsAccepted: boolean;
}

export interface IndividualOwnerDetailsData {
  legalFullName: string;
  dateOfBirth: string;
  panNumber: string;
  residentialAddress: string;
  state: string;
  city: string;
  pinCode: string;
}

export interface CompanyDetailsData {
  legalBusinessName: string;
  tradeName: string;
  constitution: BusinessConstitution;
  companyPan: string;
  gstin: string;
  registeredAddress: string;
  state: string;
  city: string;
  pinCode: string;
  representativeName: string;
  representativeDesignation: string;
  representativeMobile: string;
  representativeEmail: string;
}

export interface DriverRecord {
  id: string;
  isPrimary: boolean;
  fullName: string;
  mobileNumber: string;
  licenceNumber: string;
  licenceExpiryDate: string;
  licenceClass: LicenceClassType;
  address: string;
  licenceDocument: UploadedDocumentMeta | null;
}

export interface TransporterRegistrationDraft {
  draftId: string;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  account: AccountDraftData;
  transporterType: TransporterType;
  individualDetails: IndividualOwnerDetailsData;
  companyDetails: CompanyDetailsData;
  drivers: DriverRecord[];
  documents: Partial<Record<DocumentSlotKey, UploadedDocumentMeta>>;
  identityProofType: IdentityProofType;
  addressProofType: AddressProofType;
  declarationConfirmed: boolean;
  updatedAt: string;
}

export interface SubmittedTransporterApplicationSummary {
  applicationId: string;
  submittedAt: string;
  verificationStatus: VerificationStatus;
  transporterType: TransporterType;
  applicantName: string;
  mobileNumber: string;
  email: string;
  maskedPan: string;
  city: string;
  state: string;
  driverCount: number;
  primaryDriverName: string;
  uploadedDocuments: Array<{
    slotKey: DocumentSlotKey;
    label: string;
    fileName: string;
    status: 'Uploaded';
  }>;
  bookingAccessAllowed: boolean;
  accountAuthStatus: 'pending_auth_provider' | 'verified';
  reviewNote: string;
}
