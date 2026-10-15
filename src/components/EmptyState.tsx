import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { theme } from '../lib/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: 8,
    minWidth: 180,
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
