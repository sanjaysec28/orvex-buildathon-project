export interface OrvexEnvironmentConfig {
  apiBaseUrl: string | null;
  firebaseProjectId: string | null;
  googleMapsConfigured: boolean;
}

export function getEnvironmentConfig(): OrvexEnvironmentConfig {
  const env = import.meta.env ?? {};
  return {
    apiBaseUrl: typeof env.VITE_API_BASE_URL === 'string' && env.VITE_API_BASE_URL.length > 0
      ? env.VITE_API_BASE_URL
      : null,
    firebaseProjectId:
      typeof env.VITE_FIREBASE_PROJECT_ID === 'string' && env.VITE_FIREBASE_PROJECT_ID.length > 0
        ? env.VITE_FIREBASE_PROJECT_ID
        : null,
    googleMapsConfigured:
      typeof env.VITE_GOOGLE_MAPS_API_KEY === 'string' && env.VITE_GOOGLE_MAPS_API_KEY.length > 0,
  };
}
