import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

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
          headerLeft: () => (
            <Image
              accessibilityIgnoresInvertColors
              source={require('../../../assets/logo.png')}
              style={styles.headerMark}
            />
          ),
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

const styles = StyleSheet.create({
  headerMark: {
    height: 28,
    resizeMode: 'contain',
    width: 28,
  },
});
