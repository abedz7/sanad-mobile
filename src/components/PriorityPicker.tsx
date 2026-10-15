import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from './Badge';
import { OptionModal, OptionRow } from './OptionModal';
import { PRIORITY_LABELS } from '../lib/labels';
import { theme } from '../lib/theme';
import type { Priority } from '../types/api';

const PRIORITIES = Object.keys(PRIORITY_LABELS) as Priority[];

interface PriorityPickerProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Priority</Text>
      <Pressable
        accessibilityLabel="Priority"
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={styles.field}
      >
        {/* Badge is alignSelf:flex-start for its flex-wrap usage elsewhere; wrap it
            so this row's alignItems:center can still centre it vertically. */}
        <View>
          <Badge priority={value} />
        </View>
        <Ionicons color={theme.textMuted} name="chevron-down" size={18} />
      </Pressable>

      <OptionModal onClose={() => setOpen(false)} title="Priority" visible={open}>
        {PRIORITIES.map((priority) => (
          <OptionRow
            key={priority}
            label={PRIORITY_LABELS[priority].label}
            onPress={() => {
              onChange(priority);
              setOpen(false);
            }}
            selected={priority === value}
          />
        ))}
      </OptionModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  field: {
    alignItems: 'center',
    borderColor: theme.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
