import { Stack } from 'expo-router';

import { theme } from '../../../src/lib/theme';

export default function TicketsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.accent,
        headerTitleStyle: { color: theme.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My tickets' }} />
      <Stack.Screen name="new" options={{ title: 'New ticket', presentation: 'modal' }} />
    </Stack>
  );
}
