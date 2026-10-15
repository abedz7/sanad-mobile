import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { theme } from '../lib/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon = 'file-tray-outline',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons color={theme.accent} name={icon} size={32} />
      </View>
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

const ICON_CIRCLE = 72;

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
  iconCircle: {
    alignItems: 'center',
    backgroundColor: theme.accentTint,
    borderRadius: ICON_CIRCLE / 2,
    height: ICON_CIRCLE,
    justifyContent: 'center',
    marginBottom: 8,
    width: ICON_CIRCLE,
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
