import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';

import { theme } from '../lib/theme';
import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * One grey bone with a soft highlight sweeping across it. When the OS asks for
 * reduced motion the bone renders static.
 */
function Bone({ width, height }: { width: DimensionValue; height: number }) {
  const reduced = useReducedMotion();
  const [measured, setMeasured] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced || measured === 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.delay(500),
      ]),
    );
    progress.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [reduced, measured, progress]);

  const band = measured * 0.6;
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-band, measured],
  });

  return (
    <View
      onLayout={(event) => setMeasured(event.nativeEvent.layout.width)}
      style={[styles.bone, { width, height }]}
    >
      {!reduced && measured > 0 ? (
        <Animated.View
          style={[styles.shimmer, { width: band, transform: [{ translateX }, { skewX: '-20deg' }] }]}
        />
      ) : null}
    </View>
  );
}

/** Placeholder card shown while the ticket list loads. */
export function TicketCardSkeleton() {
  return (
    <View style={styles.card}>
      <Bone width="80%" height={18} />
      <View style={styles.row}>
        <Bone width={70} height={22} />
        <Bone width={70} height={22} />
      </View>
      <Bone width="50%" height={14} />
    </View>
  );
}

/** Placeholder comment shown while comments load or the next page is fetched. */
export function CommentRowSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.rowSpread}>
        <Bone width={110} height={14} />
        <Bone width={64} height={14} />
      </View>
      <Bone width="100%" height={14} />
      <Bone width="65%" height={14} />
    </View>
  );
}

/** Placeholder for the ticket detail: header block plus two comment rows. */
export function TicketDetailSkeleton() {
  return (
    <View style={styles.detail}>
      <View style={styles.card}>
        <Bone width="90%" height={10} />
        <Bone width="70%" height={20} />
        <View style={styles.row}>
          <Bone width={70} height={22} />
          <Bone width={70} height={22} />
        </View>
        <Bone width="100%" height={14} />
        <Bone width="100%" height={14} />
        <Bone width="40%" height={14} />
      </View>
      <CommentRowSkeleton />
      <CommentRowSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: theme.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  detail: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowSpread: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  shimmer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    bottom: 0,
    position: 'absolute',
    top: 0,
  },
});
