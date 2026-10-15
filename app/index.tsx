import { Redirect } from 'expo-router';

import { useAuth } from '../src/auth/AuthProvider';

// Entry route: "/" resolves to the right group for the session. The root
// layout's splash gate guarantees status is settled before this renders.
export default function Index() {
  const { status } = useAuth();
  return status === 'signedIn' ? (
    <Redirect href="/(app)/tickets" />
  ) : (
    <Redirect href="/(auth)/sign-in" />
  );
}
