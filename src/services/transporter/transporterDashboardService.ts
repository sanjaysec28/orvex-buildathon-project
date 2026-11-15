import type {
  AuthenticatedUserSession,
  LoadOpportunity,
  ShipperDashboardOverview,
  ShipperDemoShipment,
  TransporterDashboardOverview,
  TransporterDriver,
  TransporterNotification,
  TransporterOffer,
  TransporterTrip,
  TransporterVaultDocument,
  TransporterVehicle,
  VehicleAvailabilityStatus,
  VehicleCategory,
  VehicleLengthOption,
} from '../../features/transporterDashboard/transporterDashboardTypes';

export interface AuthSessionResponse {
  ok: boolean;
  authenticated: boolean;
  user: AuthenticatedUserSession | null;
  demoModeEnabled: boolean;
}

export async function fetchAuthSession(): Promise<AuthSessionResponse> {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) {
      return { ok: false, authenticated: false, user: null, demoModeEnabled: false };
    }
    const data = (await res.json()) as Partial<AuthSessionResponse>;
    return {
      ok: Boolean(data.ok),
      authenticated: Boolean(data.authenticated),
      user: data.user ?? null,
      demoModeEnabled: Boolean(data.demoModeEnabled),
    };
  } catch {
    return { ok: false, authenticated: false, user: null, demoModeEnabled: false };
  }
}

export function mapDemoLoginErrorMessage(code?: string, fallback?: string): string {
  switch (code) {
    case 'DEMO_MODE_DISABLED':
      return 'Temporary Demo Login is disabled in this environment (NODE_ENV=production or ORVEX_DEMO_MODE=false).';
    case 'AUTHENTICATION_REQUIRED':
      return 'Authentication session could not be verified by the server. Please allow cookies and try again.';
    case 'ROLE_MISMATCH':
      return 'Demo session role did not match the requested workspace.';
    case 'INVALID_SESSION_RESPONSE':
      return 'Server returned an invalid demo session response.';
    case 'SERVER_ERROR':
      return 'Server error while starting the demo session. Please try again.';
    case 'NETWORK_ERROR':
      return 'Network error while starting the demo session. Check that the ORVEX server is running.';
    default:
      return fallback && fallback.trim().length > 0
        ? fallback
        : 'Demo login is unavailable right now.';
  }
}

export async function loginAsDemoRole(role: 'transporter' | 'shipper'): Promise<
  | { ok: true; user: AuthenticatedUserSession }
  | { ok: false; code?: string; message: string }
> {
  try {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    let payload: {
      ok?: boolean;
      user?: AuthenticatedUserSession;
      code?: string;
      message?: string;
    } | null = null;

    try {
      payload = (await res.json()) as {
        ok?: boolean;
        user?: AuthenticatedUserSession;
        code?: string;
        message?: string;
      };
    } catch {
      payload = null;
    }

    if (!res.ok) {
      const code = payload?.code ?? (res.status >= 500 ? 'SERVER_ERROR' : undefined);
      return {
        ok: false,
        code,
        message: mapDemoLoginErrorMessage(code, payload?.message),
      };
    }

    if (!payload?.ok || !payload.user || !payload.user.uid) {
      return {
        ok: false,
        code: 'INVALID_SESSION_RESPONSE',
        message: mapDemoLoginErrorMessage('INVALID_SESSION_RESPONSE', payload?.message),
      };
    }

    if (payload.user.role !== role) {
      return {
        ok: false,
        code: 'ROLE_MISMATCH',
        message: mapDemoLoginErrorMessage('ROLE_MISMATCH'),
      };
    }

    return { ok: true, user: payload.user };
  } catch {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: mapDemoLoginErrorMessage('NETWORK_ERROR'),
    };
  }
}

export async function logoutTransporterSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore transient network errors during logout
  }
}

export type ProtectedApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code?: string; message: string };

async function apiGet<T>(url: string): Promise<ProtectedApiResult<T>> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
    });
    const payload = (await res.json()) as T & { ok?: boolean; code?: string; message?: string };
    if (!res.ok || payload.ok === false) {
      return {
        ok: false,
        status: res.status,
        code: payload.code,
        message: payload.message ?? 'Unable to load dashboard data.',
      };
    }
    return { ok: true, data: payload };
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network error while connecting to ORVEX services.',
    };
  }
}

async function apiSend<T>(
  url: string,
  method: 'POST' | 'PUT',
  body: unknown,
): Promise<ProtectedApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = (await res.json()) as T & { ok?: boolean; code?: string; message?: string };
    if (!res.ok || payload.ok === false) {
      return {
        ok: false,
        status: res.status,
        code: payload.code,
        message: payload.message ?? 'Request could not be completed.',
      };
    }
    return { ok: true, data: payload };
  } catch {
    return {
      ok: false,
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network error while saving changes.',
    };
  }
}

export async function fetchDashboardOverview(): Promise<
  ProtectedApiResult<{ overview: TransporterDashboardOverview }>
> {
  return apiGet('/api/transporter/dashboard');
}

export async function fetchTransporterVehicles(): Promise<
  ProtectedApiResult<{ vehicles: TransporterVehicle[] }>
> {
  return apiGet('/api/transporter/vehicles');
}

export async function addTransporterVehicle(input: {
  registrationNumber: string;
  vehicleCategory: VehicleCategory;
  lengthFt: VehicleLengthOption;
  capacityTonnes: number;
  currentCity: string;
  availabilityStatus?: VehicleAvailabilityStatus;
}): Promise<ProtectedApiResult<{ vehicle: TransporterVehicle }>> {
  return apiSend('/api/transporter/vehicles', 'POST', input);
}

export async function updateVehicleAvailability(input: {
  vehicleId: string;
  availabilityStatus: VehicleAvailabilityStatus;
  currentCity: string;
  availableFrom?: string;
}): Promise<ProtectedApiResult<{ vehicle: TransporterVehicle }>> {
  return apiSend(`/api/transporter/vehicles/${encodeURIComponent(input.vehicleId)}/availability`, 'PUT', input);
}

export async function fetchTransporterDrivers(): Promise<
  ProtectedApiResult<{ drivers: TransporterDriver[] }>
> {
  return apiGet('/api/transporter/drivers');
}

export async function addTransporterDriver(input: {
  fullName: string;
  mobileNumber: string;
  licenceNumber: string;
  licenceExpiry: string;
  licenceCategory: string;
  assignedVehicleId?: string;
}): Promise<ProtectedApiResult<{ driver: TransporterDriver }>> {
  return apiSend('/api/transporter/drivers', 'POST', input);
}

export async function fetchTransporterLoads(filters?: {
  mode?: string;
  origin?: string;
  destination?: string;
  vehicleCategory?: string;
}): Promise<
  ProtectedApiResult<{
    loads: LoadOpportunity[];
    returnContext: { originCity: string; destinationCity: string } | null;
  }>
> {
  const qs = new URLSearchParams();
  if (filters?.mode) qs.set('mode', filters.mode);
  if (filters?.origin) qs.set('origin', filters.origin);
  if (filters?.destination) qs.set('destination', filters.destination);
  if (filters?.vehicleCategory) qs.set('vehicleCategory', filters.vehicleCategory);
  const query = qs.toString();
  return apiGet(`/api/transporter/loads${query ? `?${query}` : ''}`);
}

export async function fetchLoadById(loadId: string): Promise<
  ProtectedApiResult<{ load: LoadOpportunity; compatibleVehicles: TransporterVehicle[] }>
> {
  return apiGet(`/api/transporter/loads/${encodeURIComponent(loadId)}`);
}

export async function submitLoadOffer(input: {
  loadId: string;
  proposedFreightInr: number;
  vehicleId: string;
  notes?: string;
}): Promise<ProtectedApiResult<{ offer: TransporterOffer }>> {
  return apiSend('/api/transporter/offers', 'POST', input);
}

export async function fetchTransporterTrips(): Promise<
  ProtectedApiResult<{ trips: TransporterTrip[] }>
> {
  return apiGet('/api/transporter/trips');
}

export async function createOrCompleteTrip(input: {
  action: 'complete';
  tripId: string;
}): Promise<ProtectedApiResult<{ trip: TransporterTrip }>> {
  return apiSend('/api/transporter/trips', 'POST', input);
}

export async function fetchTransporterOffers(): Promise<
  ProtectedApiResult<{ offers: TransporterOffer[] }>
> {
  return apiGet('/api/transporter/offers');
}

export async function fetchTransporterEarnings(): Promise<
  ProtectedApiResult<{
    monthlyEarningsInr: number;
    totalCompletedTrips: number;
    payouts: Array<{
      tripId: string;
      routeLabel: string;
      vehicleReg: string;
      freightInr: number;
      completedAt: string;
    }>;
  }>
> {
  return apiGet('/api/transporter/earnings');
}

export async function fetchTransporterNotifications(): Promise<
  ProtectedApiResult<{ notifications: TransporterNotification[]; unreadCount: number }>
> {
  return apiGet('/api/transporter/notifications');
}

export async function markNotificationsRead(notificationId?: string): Promise<
  ProtectedApiResult<{ unreadCount: number }>
> {
  return apiSend('/api/transporter/notifications/read', 'POST', {
    notificationId: notificationId ?? 'all',
  });
}

export async function fetchTransporterDocuments(): Promise<
  ProtectedApiResult<{ documents: TransporterVaultDocument[] }>
> {
  return apiGet('/api/transporter/documents');
}

export async function updateTransporterProfile(input: {
  displayName: string;
  companyName?: string;
  city?: string;
  state?: string;
  email?: string;
}): Promise<ProtectedApiResult<{ profile: AuthenticatedUserSession }>> {
  return apiSend('/api/transporter/profile', 'PUT', input);
}

export async function fetchShipperDashboard(): Promise<
  ProtectedApiResult<{ overview: ShipperDashboardOverview }>
> {
  return apiGet('/api/shipper/dashboard');
}

export async function createDemoShipperShipment(input: {
  originCity: string;
  destinationCity: string;
  cargoType: string;
  weightTonnes: number;
  requiredVehicleSpec: string;
  estimatedBudgetInr: number;
}): Promise<ProtectedApiResult<{ shipment: ShipperDemoShipment }>> {
  return apiSend('/api/shipper/shipments', 'POST', input);
}

export async function acceptDemoShipperOffer(
  offerId: string,
): Promise<ProtectedApiResult<{ overview: ShipperDashboardOverview }>> {
  return apiSend(`/api/shipper/offers/${encodeURIComponent(offerId)}/accept`, 'POST', {});
}
