import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../src/lib/theme';

// Placeholder — the real list (loading/empty/error, pull-to-refresh, infinite
// scroll) lands with the tickets API hooks.
export default function TicketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My tickets</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.background,
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: theme.textMuted,
    fontSize: 16,
  },
});
