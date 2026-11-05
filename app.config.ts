import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json. EXPO_BASE_URL serves the web build from a sub-path — the GitHub Pages
 * workflow sets it to /petfit-app. Local `expo start` leaves it unset, so dev stays at /.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
