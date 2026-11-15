import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeCompatibleLoadsForFleet,
  evaluateShipperAccess,
  evaluateTransporterAccess,
  formatInr,
  getInitials,
  isValidRegistrationNumber,
  normalizeRegistrationNumber,
} from './transporterDashboardUtils.ts';
import type {
  AuthenticatedUserSession,
  LoadOpportunity,
  TransporterTrip,
  TransporterVehicle,
} from './transporterDashboardTypes.ts';

test('formatInr formats Indian rupee amounts cleanly with Indian numbering commas', () => {
  assert.equal(formatInr(0), '₹ 0');
  assert.equal(formatInr(72000), '₹ 72,000');
  assert.equal(formatInr(486500), '₹ 4,86,500');
});

test('getInitials extracts clean two-letter initials from dynamic transporter name', () => {
  assert.equal(getInitials('Rajesh Kumar'), 'RK');
  assert.equal(getInitials('Arvind'), 'AR');
  assert.equal(getInitials('  '), 'TR');
});

test('vehicle registration validator and normalizer handle Indian plates accurately', () => {
  assert.equal(isValidRegistrationNumber('tn02ab4567'), true);
  assert.equal(isValidRegistrationNumber('KA 01 MG 9012'), true);
  assert.equal(isValidRegistrationNumber('INVALID'), false);
  assert.equal(normalizeRegistrationNumber('tn2ab4567'), 'TN 02 AB 4567');
});

test('evaluateTransporterAccess enforces authentication, role isolation, and verified status', () => {
  assert.deepEqual(evaluateTransporterAccess(null), {
    allow: false,
    action: 'redirect_login',
  });
  assert.deepEqual(evaluateTransporterAccess(null, 'shipper'), {
    allow: false,
    action: 'redirect_shipper',
  });

  const shipperSession: AuthenticatedUserSession = {
    uid: 'shp_1',
    role: 'shipper',
    displayName: 'Shipper User',
    mobileNumber: '+919876543210',
    verificationStatus: 'Verified',
    bookingAccessAllowed: true,
    authProvider: 'orvex-session',
  };
  assert.deepEqual(evaluateTransporterAccess(shipperSession), {
    allow: false,
    action: 'redirect_shipper',
  });

  const pendingTransporter: AuthenticatedUserSession = {
    uid: 'tr_1',
    role: 'transporter',
    displayName: 'Pending User',
    mobileNumber: '+919876543210',
    verificationStatus: 'Under Verification',
    bookingAccessAllowed: false,
    authProvider: 'orvex-session',
  };
  assert.deepEqual(evaluateTransporterAccess(pendingTransporter), {
    allow: false,
    action: 'show_verification_status',
  });

  const verifiedTransporter: AuthenticatedUserSession = {
    ...pendingTransporter,
    verificationStatus: 'Verified',
    bookingAccessAllowed: true,
  };
  assert.deepEqual(evaluateTransporterAccess(verifiedTransporter), { allow: true });

  const demoTransporter: AuthenticatedUserSession = {
    ...pendingTransporter,
    uid: 'demo_transporter_orvex',
    verificationStatus: 'Demo Verified',
    bookingAccessAllowed: true,
    isDemo: true,
    authProvider: 'orvex-demo',
  };
  assert.deepEqual(evaluateTransporterAccess(demoTransporter), { allow: true });

  const forgedDemoTransporter: AuthenticatedUserSession = {
    ...pendingTransporter,
    verificationStatus: 'Demo Verified',
    bookingAccessAllowed: true,
    isDemo: false,
  };
  assert.deepEqual(evaluateTransporterAccess(forgedDemoTransporter), {
    allow: false,
    action: 'show_verification_status',
  });
});

test('evaluateShipperAccess enforces authentication, role isolation, and verified/demo-verified status', () => {
  assert.deepEqual(evaluateShipperAccess(null), {
    allow: false,
    action: 'redirect_login',
  });

  const transporterSession: AuthenticatedUserSession = {
    uid: 'tr_1',
    role: 'transporter',
    displayName: 'Transporter User',
    mobileNumber: '+919876543210',
    verificationStatus: 'Verified',
    bookingAccessAllowed: true,
    authProvider: 'orvex-session',
  };
  assert.deepEqual(evaluateShipperAccess(transporterSession), {
    allow: false,
    action: 'redirect_transporter',
  });

  const demoShipper: AuthenticatedUserSession = {
    uid: 'demo_shipper_orvex',
    role: 'shipper',
    displayName: 'ORVEX Demo Shipper',
    mobileNumber: '+919876500002',
    verificationStatus: 'Demo Verified',
    bookingAccessAllowed: true,
    isDemo: true,
    authProvider: 'orvex-demo',
  };
  assert.deepEqual(evaluateShipperAccess(demoShipper), { allow: true });

  const forgedDemoShipper: AuthenticatedUserSession = {
    ...demoShipper,
    isDemo: false,
  };
  assert.deepEqual(evaluateShipperAccess(forgedDemoShipper), {
    allow: false,
    action: 'show_verification_status',
  });
});

test('computeCompatibleLoadsForFleet filters by vehicle capacity, length/body, and flags return corridor matches', () => {
  const vehicles: TransporterVehicle[] = [
    {
      id: 'v1',
      registrationNumber: 'TN 02 AB 4567',
      vehicleCategory: 'Closed Body',
      lengthFt: '17 ft',
      capacityTonnes: 9,
      availabilityStatus: 'Available',
      currentCity: 'Chennai',
      createdAt: '2026-11-15T00:00:00Z',
    },
  ];
  const trips: TransporterTrip[] = [
    {
      id: 't1',
      vehicleId: 'v1',
      vehicleReg: 'TN 02 AB 4567',
      driverName: 'Karthik M',
      originCity: 'Chennai',
      originState: 'TN',
      destinationCity: 'Bengaluru',
      destinationState: 'KA',
      cargoType: 'Auto Components',
      weightTonnes: 6,
      freightInr: 42000,
      status: 'In Transit',
      etaLabel: 'Today, 6:00 PM',
      startedAt: '2026-11-15T00:00:00Z',
    },
  ];
  const loads: LoadOpportunity[] = [
    {
      id: 'l_small',
      originCity: 'Bengaluru',
      originState: 'KA',
      destinationCity: 'Chennai',
      destinationState: 'TN',
      cargoType: 'Textile Goods',
      requiredVehicleCategory: 'Closed Body',
      requiredLengthFt: '17 ft / 20 ft',
      weightTonnes: 8,
      expectedFreightInr: 72000,
      distanceKm: 345,
      pickupWindowLabel: 'Today, 7:30 PM',
      corridorTag: 'BLR ↔ MAA',
      compatibleVehicleIds: [],
    },
    {
      id: 'l_heavy',
      originCity: 'Coimbatore',
      originState: 'TN',
      destinationCity: 'Hyderabad',
      destinationState: 'TG',
      cargoType: 'Machinery Parts',
      requiredVehicleCategory: 'Trailer',
      requiredLengthFt: '32 ft',
      weightTonnes: 16,
      expectedFreightInr: 118000,
      distanceKm: 880,
      pickupWindowLabel: 'Tomorrow, 9:00 AM',
      corridorTag: 'CJB → HYD',
      compatibleVehicleIds: [],
    },
  ];

  const matched = computeCompatibleLoadsForFleet({ vehicles, trips, loads });
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, 'l_small');
  assert.equal(matched[0].isReturnMatch, true);
  assert.deepEqual(matched[0].compatibleVehicleIds, ['v1']);

  assert.deepEqual(computeCompatibleLoadsForFleet({ vehicles: [], trips: [], loads }), []);
});
