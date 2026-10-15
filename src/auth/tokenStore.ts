import * as SecureStore from 'expo-secure-store';

/**
 * The only module allowed to import expo-secure-store.
 *
 * Refresh token: device keychain/keystore via expo-secure-store.
 * Access token: module-level variable only — it lives 15 minutes and must not
 * survive the process, so it is never persisted anywhere.
 */

const REFRESH_TOKEN_KEY = 'sanad.refreshToken';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/** Wipes both tokens. Used on sign-out and on refresh failure. */
export async function clearTokens(): Promise<void> {
  accessToken = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
