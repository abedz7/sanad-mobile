import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { ApiRequestError } from '../src/api/client';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
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

function RootNavigator() {
  const { status } = useAuth();

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
