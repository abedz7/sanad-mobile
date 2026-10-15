import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from './ErrorState';
import { OptionModal, OptionRow } from './OptionModal';
import { useCategories } from '../api/categories';
import { theme } from '../lib/theme';
import type { Category } from '../types/api';

interface CategoryPickerProps {
  value: Category | null;
  onChange: (category: Category) => void;
  error?: string;
}

/** Self-contained category select: fetches, and owns loading/error states. */
export function CategoryPicker({ value, onChange, error }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: categories, isPending, isError, error: fetchError, refetch } = useCategories();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <Pressable
        accessibilityLabel="Category"
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.field, !!error && styles.fieldError]}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? value.name : 'Select a category'}
        </Text>
        <Ionicons color={theme.textMuted} name="chevron-down" size={18} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <OptionModal onClose={() => setOpen(false)} title="Category" visible={open}>
        {isPending ? (
          <ActivityIndicator color={theme.accent} style={styles.loading} />
        ) : isError ? (
          <ErrorState error={fetchError} onRetry={() => refetch()} />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(category) => category.id}
            renderItem={({ item }) => (
              <OptionRow
                description={item.description}
                label={item.name}
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
                selected={item.id === value?.id}
              />
            )}
          />
        )}
      </OptionModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  errorText: {
    color: theme.danger,
    fontSize: 13,
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
  fieldError: {
    borderColor: theme.danger,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  loading: {
    paddingVertical: 24,
  },
  placeholder: {
    color: theme.textMuted,
    fontSize: 16,
  },
  value: {
    color: theme.text,
    fontSize: 16,
  },
});
