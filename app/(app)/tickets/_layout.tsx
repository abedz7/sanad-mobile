import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';

import { theme } from '../../../src/lib/theme';

export default function TicketsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.accent,
        headerTitleStyle: { color: theme.text },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My tickets',
          headerRight: () => (
            <Link accessibilityLabel="Create ticket" href="/(app)/tickets/new">
              <Ionicons name="add" color={theme.accent} size={28} />
            </Link>
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: 'New ticket', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Ticket' }} />
    </Stack>
  );
}
