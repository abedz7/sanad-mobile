import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { STATUS_LABELS } from '../lib/labels';
import { theme } from '../lib/theme';
import { useReducedMotion } from '../lib/useReducedMotion';
import type { Status } from '../types/api';

const STEPS: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
const DOT = 12;

/** Open → In Progress → Resolved → Closed; the current step scales/colours in. */
export function StatusStepper({ status }: { status: Status }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <View accessibilityLabel={`Status: ${STATUS_LABELS[status].label}`} style={styles.container}>
      {STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <View key={step} style={styles.step}>
            {index > 0 ? (
              <View style={[styles.connector, reached && styles.connectorReached]} />
            ) : null}
            <Dot reached={reached} isCurrent={isCurrent} />
            <Text
              numberOfLines={1}
              style={[styles.label, isCurrent && styles.labelCurrent]}
            >
              {STATUS_LABELS[step].label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Dot({ reached, isCurrent }: { reached: boolean; isCurrent: boolean }) {
  const reducedMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(isCurrent ? 1.5 : 1));

  useEffect(() => {
    Animated.timing(scale, {
      toValue: isCurrent ? 1.5 : 1,
      duration: reducedMotion ? 0 : 200,
      useNativeDriver: true,
    }).start();
  }, [isCurrent, scale, reducedMotion]);

  return (
    <Animated.View
      style={[
        styles.dot,
        reached && styles.dotReached,
        isCurrent && styles.dotCurrentBorder,
        { transform: [{ scale }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  connector: {
    backgroundColor: theme.border,
    height: 2,
    left: '-50%',
    position: 'absolute',
    right: '50%',
    top: DOT / 2 - 1,
  },
  connectorReached: {
    backgroundColor: theme.accent,
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dot: {
    backgroundColor: theme.border,
    borderRadius: DOT / 2,
    height: DOT,
    width: DOT,
    zIndex: 1,
  },
  dotCurrentBorder: {
    borderColor: theme.accentTint,
    borderWidth: 2,
  },
  dotReached: {
    backgroundColor: theme.accent,
  },
  label: {
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  labelCurrent: {
    color: theme.accent,
    fontWeight: '600',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
});
