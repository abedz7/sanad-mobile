import { useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive';
}

const VARIANTS = {
  primary: { base: theme.accent, pressed: theme.accentShade, label: '#ffffff' },
  secondary: { base: theme.surface, pressed: theme.border, label: theme.text },
  destructive: { base: theme.danger, pressed: '#7f1d1d', label: '#ffffff' },
} as const;

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ButtonProps) {
  const { base, pressed, label } = VARIANTS[variant];
  const isDisabled = disabled || loading;
  const [scale] = useState(() => new Animated.Value(1));

  const pressTo = (toValue: number) => {
    Animated.timing(scale, { toValue, duration: 100, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => pressTo(0.98)}
        onPressOut={() => pressTo(1)}
        style={({ pressed: isPressed }) => [
          styles.button,
          { backgroundColor: isPressed ? pressed : base },
          variant === 'secondary' && styles.secondaryBorder,
          isDisabled && styles.disabled,
        ]}
      >
        {/* The label always lays out so the button keeps its width while loading. */}
        <Text style={[styles.label, { color: label }, loading && styles.labelHidden]}>
          {title}
        </Text>
        {loading ? (
          <View style={styles.spinner}>
            <ActivityIndicator color={label} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBorder: {
    borderColor: theme.border,
    borderWidth: 1,
  },
  labelHidden: {
    opacity: 0,
  },
  spinner: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
