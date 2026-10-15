import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../src/lib/theme';

// Placeholder — the create-ticket form (title, category, priority, description,
// attachments) ships in Phase 4b.
export default function NewTicketScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create ticket</Text>
      <Text style={styles.text}>Coming in Phase 4b.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.background,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: theme.textMuted,
    fontSize: 15,
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
