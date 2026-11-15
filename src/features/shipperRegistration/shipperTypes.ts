import type {
  AddressProofType,
  BusinessConstitution,
  IdentityProofType,
  UploadedDocumentMeta,
  VerificationStatus,
} from '../registration/registrationTypes';

export type ShipperBusinessType = 'individual' | 'company';

export type ShipperDocumentSlotKey =
  | 'panCard'
  | 'identityProof'
  | 'addressProof'
  | 'constitutionProof'
  | 'gstCertificate'
  | 'authorisationDoc';

export type MainGoodsCategory =
  | 'General Goods'
  | 'FMCG'
  | 'Textiles'
  | 'Machinery'
  | 'Agricultural Products'
  | 'Electronics'
  | 'Other';

export type ShipmentFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Occasional';

export type WeightUnit = 'Tonnes' | 'Kg';

export type ShipperVehicleType =
  | '14 ft'
  | '17 ft'
  | '20 ft'
  | '32 ft'
  | 'Open Body'
  | 'Container'
  | 'Trailer';

export type BusinessCategoryOption =
  | 'Retail Store'
  | 'Wholesale & Trading'
  | 'Manufacturing'
  | 'Distribution & Warehousing'
  | 'Agriculture & Produce'
  | 'Textiles & Apparel'
  | 'FMCG & Consumer Goods'
  | 'E-commerce & D2C'
  | 'Industrial Equipment'
  | 'Other';

export interface ShipperAccountDraftData {
  fullName: string;
  mobileNumber: string;
  email: string;
  termsAccepted: boolean;
}

export interface IndividualSellerDetailsData {
  businessShopName: string;
  ownerFullName: string;
  businessCategory: BusinessCategoryOption;
  panNumber: string;
  gstin: string;
  businessAddress: string;
  state: string;
  city: string;
  pinCode: string;
}

export interface RegisteredCompanyShipperDetailsData {
  legalCompanyName: string;
  tradeName: string;
  constitution: BusinessConstitution;
  companyPan: string;
  gstin: string;
  businessCategory: BusinessCategoryOption;
  businessWebsite: string;
  registeredAddress: string;
  state: string;
  city: string;
  pinCode: string;
  representativeName: string;
  representativeDesignation: string;
  representativeMobile: string;
  representativeEmail: string;
}

export interface ShippingProfileData {
  mainGoodsCategory: MainGoodsCategory;
  typicalCargo: string[];
  averageWeightValue: string;
  averageWeightUnit: WeightUnit;
  preferredVehicleTypes: ShipperVehicleType[];
  primaryPickupLocation: string;
  regularDeliveryLocations: string[];
  shipmentFrequency: ShipmentFrequency;
}

export interface ShipperRegistrationDraft {
  draftId: string;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  account: ShipperAccountDraftData;
  businessType: ShipperBusinessType | null;
  individualDetails: IndividualSellerDetailsData;
  companyDetails: RegisteredCompanyShipperDetailsData;
  shippingProfile: ShippingProfileData;
  documents: Partial<Record<ShipperDocumentSlotKey, UploadedDocumentMeta>>;
  identityProofType: IdentityProofType;
  addressProofType: AddressProofType;
  declarationConfirmed: boolean;
  updatedAt: string;
}

export interface SubmittedShipperApplicationSummary {
  applicationId: string;
  submittedAt: string;
  verificationStatus: VerificationStatus;
  businessType: ShipperBusinessType;
  businessName: string;
  businessCategory: string;
  applicantName: string;
  mobileNumber: string;
  email: string;
  maskedPan: string | null;
  city: string;
  state: string;
  shippingProfile: {
    mainGoodsCategory: MainGoodsCategory;
    typicalCargo: string[];
    averageWeightLabel: string;
    preferredVehicleTypes: ShipperVehicleType[];
    primaryPickupLocation: string;
    regularDeliveryLocations: string[];
    shipmentFrequency: ShipmentFrequency;
  };
  uploadedDocuments: Array<{
    slotKey: ShipperDocumentSlotKey;
    label: string;
    fileName: string;
    status: 'Uploaded';
  }>;
  bookingAccessAllowed: boolean;
  accountAuthStatus: 'pending_auth_provider' | 'verified';
  reviewNote: string;
}
