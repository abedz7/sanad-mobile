/**
 * EXPO_PUBLIC_API_URL is the only environment variable this app reads.
 * Fail loudly at startup rather than letting axios produce opaque network errors.
 */

const raw = process.env.EXPO_PUBLIC_API_URL;

if (!raw) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and point it at a ' +
      'running sanad-server, reachable from your device (use your LAN IP for a ' +
      'physical phone, not localhost). Then restart `npx expo start`.',
  );
}

export const API_URL: string = raw.replace(/\/+$/, '');
