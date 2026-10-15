import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';

import { theme } from '../lib/theme';

function Pulse({ width, height }: { width: DimensionValue; height: number }) {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.pulse, { width, height, opacity }]} />;
}

/** Placeholder card shown while the ticket list loads. */
export function TicketCardSkeleton() {
  return (
    <View style={styles.card}>
      <Pulse width="80%" height={18} />
      <View style={styles.row}>
        <Pulse width={70} height={22} />
        <Pulse width={70} height={22} />
      </View>
      <Pulse width="50%" height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  pulse: {
    backgroundColor: theme.border,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
