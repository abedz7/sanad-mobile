import { StyleSheet, Text, View } from 'react-native';

import { Badge } from './Badge';
import { theme } from '../lib/theme';
import type { TicketListItem } from '../types/api';

function formatActivity(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TicketCard({ ticket }: { ticket: TicketListItem }) {
  return (
    <View style={styles.card}>
      <Text numberOfLines={2} style={styles.title}>
        {ticket.title}
      </Text>
      <View style={styles.badges}>
        <Badge status={ticket.status} />
        <Badge priority={ticket.priority} />
      </View>
      <View style={styles.metaRow}>
        <Text numberOfLines={1} style={styles.meta}>
          {ticket.category.name}
        </Text>
        <Text style={styles.meta}>
          {ticket.commentCount > 0 ? `💬 ${ticket.commentCount}  ` : ''}
          {ticket.attachmentCount > 0 ? `📎 ${ticket.attachmentCount}  ` : ''}
          {formatActivity(ticket.lastActivityAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  meta: {
    color: theme.textMuted,
    flexShrink: 1,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
