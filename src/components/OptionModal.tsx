import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Sheet } from './Sheet';
import { theme } from '../lib/theme';

interface OptionModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom-sheet-style modal shared by the category and priority pickers. */
export function OptionModal({ visible, title, onClose, children }: OptionModalProps) {
  return (
    <Sheet onClose={onClose} visible={visible}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose}>
          <Ionicons color={theme.textMuted} name="close" size={24} />
        </Pressable>
      </View>
      {children}
    </Sheet>
  );
}

interface OptionRowProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionRow({ label, description, selected, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{label}</Text>
        {description ? (
          <Text numberOfLines={1} style={styles.rowDescription}>
            {description}
          </Text>
        ) : null}
      </View>
      {selected ? <Ionicons color={theme.accent} name="checkmark" size={20} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  rowDescription: {
    color: theme.textMuted,
    fontSize: 13,
  },
  rowLabel: {
    color: theme.text,
    fontSize: 16,
  },
  rowLabelSelected: {
    color: theme.accent,
    fontWeight: '600',
  },
  rowPressed: {
    backgroundColor: theme.surface,
  },
  rowSelected: {
    backgroundColor: theme.accentTint,
  },
  rowText: {
    flexShrink: 1,
    gap: 2,
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
