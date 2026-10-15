import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '../lib/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, !!error && styles.inputError]}
        {...inputProps}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  error: {
    color: theme.danger,
    fontSize: 13,
  },
  hint: {
    color: theme.textMuted,
    fontSize: 13,
  },
  input: {
    borderColor: theme.border,
    borderRadius: 10,
    borderWidth: 1,
    color: theme.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: theme.danger,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
