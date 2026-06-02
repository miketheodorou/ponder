import Constants from 'expo-constants';

const SERVER_PORT = 3000;

// In dev, Metro tells us which host the bundler is reachable on — that's
// the same host the API server runs on. Using it means iOS Simulator
// (localhost), Android Emulator, and physical devices on Expo Go all
// resolve to the right machine without per-platform config.
//
// In production builds there's no Metro, so we rely on EXPO_PUBLIC_API_URL.
function resolveApiUrl(): string {
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(':').shift();
    if (host) return `http://${host}:${SERVER_PORT}/api`;
  }
  return (
    process.env.EXPO_PUBLIC_API_URL ?? `http://localhost:${SERVER_PORT}/api`
  );
}

export const API_URL = resolveApiUrl();
