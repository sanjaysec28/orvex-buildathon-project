import type { UserRole } from '../../types/domain';
import type { VerificationStatus } from '../registration/registrationTypes';

export type VehicleCategory =
  | 'Closed Body'
  | 'Open Body'
  | 'Container'
  | 'Trailer'
  | 'Refrigerated';

export type VehicleLengthOption = '14 ft' | '17 ft' | '20 ft' | '32 ft';

export type VehicleAvailabilityStatus =
  | 'Available'
  | 'On Trip'
  | 'Unavailable'
  | 'Pending Verification';

export interface ActiveVehicleRoute {
  origin: string;
  destination: string;
  etaLabel: string;
}

export interface TransporterVehicle {
  id: string;
  registrationNumber: string;
  vehicleCategory: VehicleCategory;
  lengthFt: VehicleLengthOption;
  capacityTonnes: number;
  availabilityStatus: VehicleAvailabilityStatus;
  currentCity: string;
  availableFrom?: string;
  currentRoute?: ActiveVehicleRoute;
  assignedDriverId?: string;
  createdAt: string;
}

export interface TransporterDriver {
  id: string;
  fullName: string;
  mobileNumber: string;
  licenceNumber: string;
  licenceExpiry: string;
  licenceCategory: string;
  status: 'Active' | 'Pending Verification';
  assignedVehicleId?: string;
  createdAt: string;
}

export interface LoadOpportunity {
  id: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  cargoType: string;
  requiredVehicleCategory: VehicleCategory;
  requiredLengthFt: string;
  weightTonnes: number;
  expectedFreightInr: number | null;
  distanceKm: number;
  pickupWindowLabel: string;
  corridorTag: string;
  isReturnMatch?: boolean;
  compatibleVehicleIds: string[];
  offerSubmitted?: boolean;
}

export interface TransporterTrip {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  driverName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  cargoType: string;
  weightTonnes: number;
  freightInr: number;
  status: 'In Transit' | 'Loading' | 'Completed';
  etaLabel: string;
  startedAt: string;
  completedAt?: string;
}

export interface TransporterOffer {
  id: string;
  loadId: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  cargoType: string;
  proposedFreightInr: number;
  vehicleReg: string;
  notes?: string;
  status: 'Pending Review' | 'Accepted' | 'Countered' | 'Withdrawn';
  createdAt: string;
}

export interface TransporterNotification {
  id: string;
  title: string;
  message: string;
  category: 'load' | 'trip' | 'verification' | 'earnings';
  read: boolean;
  createdAt: string;
  targetPath?: string;
}

export interface TransporterVaultDocument {
  id: string;
  title: string;
  category: 'Registration' | 'Vehicle' | 'Driver' | 'Permit';
  fileName: string;
  uploadedAt: string;
  status: 'Uploaded' | 'Pending Review' | 'Verified';
}

export type SessionVerificationStatus = VerificationStatus | 'Demo Verified';

export interface AuthenticatedUserSession {
  uid: string;
  role: UserRole;
  displayName: string;
  mobileNumber: string;
  email?: string;
  companyName?: string;
  accountTypeLabel?: string;
  city?: string;
  state?: string;
  verificationStatus: SessionVerificationStatus;
  bookingAccessAllowed: boolean;
  isDemo?: boolean;
  reviewNote?: string;
  applicationId?: string;
  authProvider: 'firebase-authentication' | 'orvex-session' | 'orvex-demo';
}

export interface TransporterDashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  activeTrips: number;
  monthlyEarningsInr: number;
}

export interface TransporterDashboardOverview {
  profile: AuthenticatedUserSession;
  metrics: TransporterDashboardMetrics;
  vehicles: TransporterVehicle[];
  drivers: TransporterDriver[];
  recommendedLoads: LoadOpportunity[];
  notifications: TransporterNotification[];
  unreadNotificationCount: number;
  activeReturnCorridor: {
    originCity: string;
    destinationCity: string;
  } | null;
  mapsConfigured: boolean;
}

export type ShipperShipmentStatus =
  | 'Draft'
  | 'Posted'
  | 'Finding Transporter'
  | 'Open for Quotes'
  | 'Offer Received'
  | 'Booked'
  | 'In Transit'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export interface ShipperDemoShipment {
  id: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  cargoType: string;
  weightTonnes: number;
  requiredVehicleSpec: string;
  pickupDateLabel: string;
  status: ShipperShipmentStatus;
  estimatedBudgetInr: number;
}

export interface ShipperDemoTransporterListing {
  id: string;
  transporterName: string;
  vehicleSpec: string;
  baseCorridor: string;
  operatingRegion?: string;
  rating?: number | null;
  completedTrips?: number | null;
  availableCount: number;
  verificationLabel: string;
  isDemoRecord?: boolean;
}

export interface ShipperDemoOffer {
  id: string;
  shipmentId: string;
  routeLabel: string;
  transporterName: string;
  vehicleReg: string;
  quotedFreightInr: number;
  etaLabel: string;
  status: 'Awaiting Shipper' | 'Accepted';
}

export interface ShipperDemoBooking {
  id: string;
  routeLabel: string;
  transporterName: string;
  vehicleReg: string;
  cargoSummary: string;
  agreedFreightInr: number;
  status: 'Confirmed' | 'In Transit' | 'Delivered';
  etaLabel?: string;
}

export interface ShipperSavedLocation {
  id: string;
  label: string;
  city: string;
  state: string;
  addressLine: string;
  locationType: 'Pickup Hub' | 'Warehouse' | 'Regular Delivery';
}

export interface ShipperDashboardMetrics {
  totalShipments: number;
  activeBookings: number;
  openOffers: number;
  monthlySpendInr: number;
}

export interface ShipperDashboardOverview {
  profile: AuthenticatedUserSession;
  businessProfile: {
    businessName: string;
    accountType: string;
    verificationStatus: SessionVerificationStatus;
    primaryHub: string;
    corridors: string[];
    typicalGoods: string;
  };
  metrics: ShipperDashboardMetrics;
  shipments: ShipperDemoShipment[];
  transporters: ShipperDemoTransporterListing[];
  offers: ShipperDemoOffer[];
  bookings: ShipperDemoBooking[];
  notifications: TransporterNotification[];
  unreadNotificationCount: number;
  savedLocations: ShipperSavedLocation[];
}
