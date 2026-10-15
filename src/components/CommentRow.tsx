import { StyleSheet, Text, View } from 'react-native';

import { formatRelative } from '../lib/format';
import { theme } from '../lib/theme';
import type { Comment } from '../types/api';

export function CommentRow({ comment }: { comment: Comment }) {
  const isAdmin = comment.author.role === 'admin';
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.author}>
          {comment.author.name}
        </Text>
        <View style={[styles.roleChip, isAdmin && styles.roleChipAdmin]}>
          <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
            {isAdmin ? 'Staff' : 'Requester'}
          </Text>
        </View>
        <Text style={styles.time}>{formatRelative(comment.createdAt)}</Text>
      </View>
      <Text style={styles.body}>{comment.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  author: {
    color: theme.text,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 21,
  },
  container: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    backgroundColor: theme.surface,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleChipAdmin: {
    backgroundColor: theme.accentTint,
  },
  roleText: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  roleTextAdmin: {
    color: theme.accent,
  },
  time: {
    color: theme.textMuted,
    fontSize: 12,
    marginLeft: 'auto',
  },
});
