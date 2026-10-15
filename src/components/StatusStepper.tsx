import { StyleSheet, Text, View } from 'react-native';

import { STATUS_LABELS } from '../lib/labels';
import { theme } from '../lib/theme';
import type { Status } from '../types/api';

const STEPS: Status[] = ['open', 'in_progress', 'resolved', 'closed'];

/** Open → In Progress → Resolved → Closed with the current step highlighted. */
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
            <View
              style={[
                styles.dot,
                reached && styles.dotReached,
                isCurrent && styles.dotCurrent,
              ]}
            />
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

const DOT = 12;

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
  dotCurrent: {
    borderColor: theme.accentTint,
    borderWidth: 3,
    height: DOT + 6,
    marginTop: -3,
    width: DOT + 6,
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
