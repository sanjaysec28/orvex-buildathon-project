export type UserRole = 'transporter' | 'shipper';

export type CorridorId = 'chennai-bengaluru';

export interface FreightCorridor {
  id: CorridorId;
  originCity: string;
  destinationCity: string;
  corridorCode: string;
  approximateDistanceKm: number;
}

export type FoundationModuleStatus = 'foundation_ready' | 'planned_phase';

export interface FoundationModuleDescriptor {
  id: string;
  titleKey: string;
  summaryKey: string;
  role: UserRole | 'shared';
  targetPhase: string;
  status: FoundationModuleStatus;
}

export type IntegrationProviderKey =
  | 'firebase_auth'
  | 'cloud_firestore'
  | 'fastapi_backend'
  | 'gemini_api'
  | 'google_adk'
  | 'cloud_run'
  | 'google_maps';

export interface IntegrationReadinessItem {
  key: IntegrationProviderKey;
  labelKey: string;
  purposeKey: string;
  configured: boolean;
}
