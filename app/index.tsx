import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '../src/auth/AuthProvider';
import { hasSeenOnboarding } from '../src/lib/onboarding';

// Entry route: "/" resolves to the right group for the session. The root
// layout's splash gate guarantees status is settled before this renders.
export default function Index() {
  const { status } = useAuth();
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    hasSeenOnboarding()
      .then((seen) => {
        if (!cancelled) setSeenOnboarding(seen);
      })
      .catch(() => {
        // An unreadable flag must never block the app — treat as seen.
        if (!cancelled) setSeenOnboarding(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'signedIn') return <Redirect href="/(app)/tickets" />;
  // The secure-store read settles in milliseconds; render nothing meanwhile.
  if (seenOnboarding === null) return null;
  return seenOnboarding ? (
    <Redirect href="/(auth)/sign-in" />
  ) : (
    <Redirect href="/(auth)/onboarding" />
  );
}
