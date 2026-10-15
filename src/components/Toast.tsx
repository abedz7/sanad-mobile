import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastListener = (message: string) => void;
let listener: ToastListener | null = null;

/** Imperative toast for transient, non-blocking messages (e.g. server 409s). */
export function showToast(message: string): void {
  listener?.(message);
}

const VISIBLE_MS = 3500;

/** Mounted once in the root layout. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    listener = setMessage;
    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setMessage(null),
      );
    }, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[styles.toast, { opacity, top: insets.top + 8 }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: 'rgba(17,24,39,0.95)',
    borderRadius: 12,
    elevation: 6,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    zIndex: 100,
  },
});
