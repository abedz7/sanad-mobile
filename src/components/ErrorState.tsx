import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { errorMessage } from '../lib/errors';
import { theme } from '../lib/theme';

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

/** Says what happened and offers a retry; never shows raw error internals. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couldn’t load this</Text>
      <Text style={styles.message}>{errorMessage(error)}</Text>
      <View style={styles.action}>
        <Button title="Retry" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: 8,
    minWidth: 140,
  },
  container: {
    alignItems: 'center',
    gap: 8,
    padding: 32,
  },
  message: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
