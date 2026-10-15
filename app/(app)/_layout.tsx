import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { theme } from '../../src/lib/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        headerTitleStyle: { color: theme.text },
      }}
    >
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'My tickets',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
