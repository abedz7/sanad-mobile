import { StyleSheet, Text, View } from 'react-native';

import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/labels';
import type { Priority, Status } from '../types/api';

type BadgeProps = { status: Status; priority?: never } | { priority: Priority; status?: never };

/** Status/priority pill; labels and colours come from the single map in labels.ts. */
export function Badge(props: BadgeProps) {
  const style = props.status ? STATUS_LABELS[props.status] : PRIORITY_LABELS[props.priority];
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.label, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
