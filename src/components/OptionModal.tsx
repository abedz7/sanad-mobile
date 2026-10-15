import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

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
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.backdrop} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose}>
            <Ionicons color={theme.textMuted} name="close" size={24} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
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
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  sheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
