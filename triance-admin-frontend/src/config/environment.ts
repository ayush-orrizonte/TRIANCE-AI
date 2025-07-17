export const environment = {
  production: import.meta.env.MODE === 'production',
  useLocalStorage: import.meta.env.VITE_USE_LOCAL_STORAGE === 'true',
  appPreferencesPrefix: import.meta.env.VITE_PREFERENCES_PREFIX || 'ts:admin:',
  authApiBaseUrl: import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:7001',
  userApiBaseUrl: import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:7002',
  adminApiBaseUrl: import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:7003',
  devoteeApiUrl: import.meta.env.VITE_DEVOTEE_API_BASE_URL || 'http://localhost:7004',
  encDecSecretKey: import.meta.env.VITE_ENC_DEC_SECRET_KEY || 'TS@$#&*(!@%^&',
  defaultDevoteeTrialPeriod: Number(import.meta.env.VITE_DEFAULT_DEVOTEE_TRIAL_PERIOD) || 3,
  skipLoaderRoutes: ['/api/v1/auth/health'],
  footerHiddenRoutes: ['/login', '/reset-password', '/forgot-password'],
};
