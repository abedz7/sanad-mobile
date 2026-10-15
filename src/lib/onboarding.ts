import * as SecureStore from 'expo-secure-store';

/**
 * First-launch flag. Not a secret, but expo-secure-store is the only
 * persistent store this app is allowed (AsyncStorage is banned by the
 * security rules), so the flag lives there alongside nothing else —
 * tokens stay in src/auth/tokenStore.ts under their own key.
 */

const ONBOARDING_KEY = 'sanad.onboardingSeen';

export async function hasSeenOnboarding(): Promise<boolean> {
  return (await SecureStore.getItemAsync(ONBOARDING_KEY)) === '1';
}

export function markOnboardingSeen(): Promise<void> {
  return SecureStore.setItemAsync(ONBOARDING_KEY, '1');
}
