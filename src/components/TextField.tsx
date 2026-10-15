import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '../lib/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  /** Password fields: adds an eye toggle that controls secureTextEntry. */
  secureToggle?: boolean;
}

export function TextField({ label, error, hint, secureToggle, ...inputProps }: TextFieldProps) {
  const [hidden, setHidden] = useState(true);
  const secure = secureToggle ? hidden : inputProps.secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textMuted}
          {...inputProps}
          secureTextEntry={secure}
          style={[
            styles.input,
            !!error && styles.inputError,
            secureToggle && styles.inputWithToggle,
            inputProps.style,
          ]}
        />
        {secureToggle ? (
          <Pressable
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setHidden((current) => !current)}
            style={styles.toggle}
          >
            <Ionicons
              color={theme.textMuted}
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
            />
          </Pressable>
        ) : null}
      </View>
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
  inputWithToggle: {
    paddingRight: 46,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    top: 0,
  },
});
