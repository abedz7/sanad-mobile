import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { ApiRequestError } from '../src/api/client';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { ToastHost } from '../src/components/Toast';
import { theme } from '../src/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 4xx responses are deterministic — retrying them only hides real errors.
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});

function Splash() {
  return (
    <View style={styles.splash}>
      <Image
        accessibilityIgnoresInvertColors
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}

/**
 * Carries a ticket deep link (sanad://tickets/<id>) through the sign-in gate:
 * the protected (app) group drops links that arrive while signed out, so the
 * id — and only a well-formed id — is parked and replayed after sign-in. The
 * detail screen re-validates and fetches through the authenticated API.
 */
function usePendingTicketLink(status: ReturnType<typeof useAuth>['status']) {
  const router = useRouter();
  const url = Linking.useURL();
  const pendingId = useRef<string | null>(null);

  useEffect(() => {
    if (!url || status !== 'signedOut') return;
    const match = /^\/?tickets\/([0-9a-f]{24})$/.exec(Linking.parse(url).path ?? '');
    if (match) pendingId.current = match[1];
  }, [url, status]);

  useEffect(() => {
    if (status !== 'signedIn' || !pendingId.current) return;
    const id = pendingId.current;
    pendingId.current = null;
    router.replace(`/(app)/tickets/${id}`);
  }, [status, router]);
}

function RootNavigator() {
  const { status } = useAuth();
  usePendingTicketLink(status);

  if (status === 'loading') return <Splash />;

  // Route groups are guarded by auth status; deep links into (app) while signed
  // out land on sign-in. Links carry ids at most — screens re-fetch everything
  // through the authenticated API and trust nothing in the URL.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
        <ToastHost />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 96,
    resizeMode: 'contain',
    width: 96,
  },
  splash: {
    alignItems: 'center',
    backgroundColor: theme.background,
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
});
