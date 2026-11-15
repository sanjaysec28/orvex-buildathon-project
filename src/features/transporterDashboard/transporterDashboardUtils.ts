import type {
  AuthenticatedUserSession,
  LoadOpportunity,
  TransporterTrip,
  TransporterVehicle,
} from './transporterDashboardTypes';

export function formatInr(amount: number): string {
  const safeValue = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `₹ ${new Intl.NumberFormat('en-IN').format(safeValue)}`;
}

export function getInitials(displayName: string): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'TR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function isValidRegistrationNumber(raw: string): boolean {
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  return /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}$/.test(normalized);
}

export function normalizeRegistrationNumber(raw: string): string {
  const compact = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = compact.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{3,4})$/);
  if (!match) {
    return raw.trim().toUpperCase().replace(/\s+/g, ' ');
  }
  return `${match[1]} ${match[2].padStart(2, '0')} ${match[3]} ${match[4]}`;
}

export function computeCompatibleLoadsForFleet(params: {
  vehicles: TransporterVehicle[];
  trips: TransporterTrip[];
  loads: LoadOpportunity[];
}): LoadOpportunity[] {
  const { vehicles, trips, loads } = params;
  const activeVehicles = vehicles.filter(
    (v) => v.availabilityStatus === 'Available' || v.availabilityStatus === 'On Trip',
  );
  if (activeVehicles.length === 0) {
    return [];
  }

  const activeReturnCities = new Set(
    trips
      .filter((t) => t.status === 'In Transit' || t.status === 'Loading')
      .map((t) => t.destinationCity.toLowerCase()),
  );

  const mapped: Array<LoadOpportunity | null> = loads.map((load): LoadOpportunity | null => {
    const matchingVehicles = activeVehicles.filter((v) => {
      const capacityOk = v.capacityTonnes >= load.weightTonnes;
      const bodyOk =
        v.vehicleCategory === load.requiredVehicleCategory ||
        (load.requiredVehicleCategory === 'Closed Body' && v.vehicleCategory === 'Container');
      const lengthTokens = load.requiredLengthFt.split('/').map((s) => s.trim());
      const lengthOk = lengthTokens.includes(v.lengthFt);
      return capacityOk && (bodyOk || lengthOk);
    });

    if (matchingVehicles.length === 0) {
      return null;
    }

    const isReturnMatch =
      activeReturnCities.has(load.originCity.toLowerCase()) ||
      activeVehicles.some(
        (v) =>
          v.availabilityStatus === 'Available' &&
          v.currentCity.toLowerCase() === load.originCity.toLowerCase(),
      );

    return {
      ...load,
      isReturnMatch,
      compatibleVehicleIds: matchingVehicles.map((v) => v.id),
    };
  });

  return mapped
    .filter((item): item is LoadOpportunity => item !== null)
    .sort((a, b) => {
      if (Boolean(a.isReturnMatch) !== Boolean(b.isReturnMatch)) {
        return a.isReturnMatch ? -1 : 1;
      }
      return (b.expectedFreightInr ?? 0) - (a.expectedFreightInr ?? 0);
    });
}

export type DashboardGuardDecision =
  | { allow: true }
  | { allow: false; action: 'redirect_login' | 'redirect_shipper' | 'show_verification_status' };

export function evaluateTransporterAccess(
  session: AuthenticatedUserSession | null,
  fallbackRoleContext?: string,
): DashboardGuardDecision {
  if (!session) {
    if (fallbackRoleContext === 'shipper') {
      return { allow: false, action: 'redirect_shipper' };
    }
    return { allow: false, action: 'redirect_login' };
  }

  if (session.role === 'shipper') {
    return { allow: false, action: 'redirect_shipper' };
  }

  if (session.role !== 'transporter') {
    return { allow: false, action: 'redirect_login' };
  }

  const isApproved =
    session.bookingAccessAllowed &&
    (session.verificationStatus === 'Verified' ||
      (session.isDemo === true && session.verificationStatus === 'Demo Verified'));

  if (!isApproved) {
    return { allow: false, action: 'show_verification_status' };
  }

  return { allow: true };
}

export type ShipperGuardDecision =
  | { allow: true }
  | { allow: false; action: 'redirect_login' | 'redirect_transporter' | 'show_verification_status' };

export function evaluateShipperAccess(
  session: AuthenticatedUserSession | null,
): ShipperGuardDecision {
  if (!session) {
    return { allow: false, action: 'redirect_login' };
  }

  if (session.role === 'transporter') {
    return { allow: false, action: 'redirect_transporter' };
  }

  if (session.role !== 'shipper') {
    return { allow: false, action: 'redirect_login' };
  }

  const isApproved =
    session.bookingAccessAllowed &&
    (session.verificationStatus === 'Verified' ||
      (session.isDemo === true && session.verificationStatus === 'Demo Verified'));

  if (!isApproved) {
    return { allow: false, action: 'show_verification_status' };
  }

  return { allow: true };
}
