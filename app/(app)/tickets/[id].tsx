import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useAddComment,
  useChangeStatus,
  useTicket,
  useTicketComments,
  useTicketHistory,
  useUpdateTicket,
} from '../../../src/api/tickets';
import { ApiRequestError } from '../../../src/api/client';
import { AttachmentPreview } from '../../../src/components/AttachmentPreview';
import { TextField } from '../../../src/components/TextField';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { CommentRow } from '../../../src/components/CommentRow';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { FadeIn } from '../../../src/components/FadeIn';
import { CommentRowSkeleton, TicketDetailSkeleton } from '../../../src/components/Skeleton';
import { StatusStepper } from '../../../src/components/StatusStepper';
import { showToast } from '../../../src/components/Toast';
import { errorMessage } from '../../../src/lib/errors';
import { formatDateTime, formatRelative } from '../../../src/lib/format';
import { allowedRequesterTransitions } from '../../../src/lib/labels';
import { theme } from '../../../src/lib/theme';
import type { Status, Ticket, TicketEvent } from '../../../src/types/api';

const OBJECT_ID = /^[0-9a-f]{24}$/;

export default function TicketDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  // The link carries an id and nothing else; anything malformed is treated the
  // same as a ticket we cannot see.
  const id = raw && OBJECT_ID.test(raw) ? raw : null;

  if (!id) return <NotFound />;
  return <TicketDetail id={id} />;
}

function NotFound() {
  const router = useRouter();
  return (
    <View style={styles.centered}>
      <EmptyState
        actionLabel="Back to my tickets"
        icon="alert-circle-outline"
        message="It may have been removed, or the link is wrong."
        onAction={() => router.replace('/(app)/tickets')}
        title="This ticket is not available"
      />
    </View>
  );
}

function TicketDetail({ id }: { id: string }) {
  const [refreshing, setRefreshing] = useState(false);
  const ticketQuery = useTicket(id);
  const commentsQuery = useTicketComments(id);
  const historyQuery = useTicketHistory(id);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        ticketQuery.refetch(),
        commentsQuery.refetch(),
        historyQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (ticketQuery.isPending) {
    return (
      <View style={styles.skeletons}>
        <TicketDetailSkeleton />
      </View>
    );
  }

  if (ticketQuery.isError) {
    const error = ticketQuery.error;
    const notFound =
      error instanceof ApiRequestError &&
      (error.code === 'NOT_FOUND' || error.code === 'VALIDATION_FAILED');
    if (notFound) return <NotFound />;
    return (
      <View style={styles.centered}>
        <ErrorState error={error} onRetry={() => ticketQuery.refetch()} />
      </View>
    );
  }

  const ticket = ticketQuery.data;
  const comments = commentsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.flex}
    >
      <FadeIn>
        <FlatList
          contentContainerStyle={styles.list}
          data={comments}
          keyExtractor={(comment) => comment.id}
          renderItem={({ item }) => <CommentRow comment={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <TicketHeader
              commentsEmpty={comments.length === 0 && !commentsQuery.isPending}
              history={historyQuery.data}
              ticket={ticket}
            />
          }
          ListFooterComponent={
            commentsQuery.isFetchingNextPage ? (
              <View style={styles.footer}>
                <CommentRowSkeleton />
              </View>
            ) : null
          }
          onEndReached={() => {
            if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
              commentsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              colors={[theme.accent]}
              onRefresh={onRefresh}
              refreshing={refreshing}
              tintColor={theme.accent}
            />
          }
          style={styles.screen}
        />
      </FadeIn>
      <Composer ticket={ticket} />
    </KeyboardAvoidingView>
  );
}

function TicketHeader({
  ticket,
  history,
  commentsEmpty,
}: {
  ticket: Ticket;
  history: TicketEvent[] | undefined;
  commentsEmpty: boolean;
}) {
  return (
    <View style={styles.header}>
      <StatusStepper status={ticket.status} />

      <View style={styles.titleRow}>
        <Text style={styles.title}>{ticket.title}</Text>
        {ticket.status === 'open' ? <EditTicketButton ticket={ticket} /> : null}
      </View>
      <View style={styles.badges}>
        <Badge status={ticket.status} />
        <Badge priority={ticket.priority} />
        <Text numberOfLines={1} style={styles.category}>
          {ticket.category.name}
        </Text>
      </View>

      <Text style={styles.description}>{ticket.description}</Text>
      <Text style={styles.dates}>
        Created {formatDateTime(ticket.createdAt)} · Updated {formatDateTime(ticket.updatedAt)}
      </Text>

      {ticket.attachments.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <View style={styles.attachments}>
            {ticket.attachments.map((attachment) => (
              <AttachmentPreview
                attachment={attachment}
                key={attachment.id}
                ticketId={ticket.id}
              />
            ))}
          </View>
        </View>
      ) : null}

      <StatusActions ticket={ticket} />

      {history && history.length > 0 ? <ActivitySection history={history} /> : null}

      <Text style={styles.sectionTitle}>Comments</Text>
      {commentsEmpty ? (
        <Text style={styles.noComments}>No comments yet — start the conversation below.</Text>
      ) : null}
    </View>
  );
}

function StatusActions({ ticket }: { ticket: Ticket }) {
  const changeStatus = useChangeStatus(ticket.id);
  const ticketQuery = useTicket(ticket.id);
  // Only what the contract allows a requester; the server still decides.
  const transitions = allowedRequesterTransitions(ticket.status, ticket.closedAt);
  if (transitions.length === 0) return null;

  const run = (to: Status, label: string) => {
    Alert.alert(label, 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label,
        style: to === 'closed' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            await changeStatus.mutateAsync(to);
          } catch (error) {
            showToast(errorMessage(error));
            if (
              error instanceof ApiRequestError &&
              (error.code === 'TICKET_INVALID_TRANSITION' || error.code === 'TICKET_CLOSED')
            ) {
              // The screen was stale about what is allowed — resync.
              ticketQuery.refetch();
            }
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.actions}>
      {transitions.map(({ to, label }) => (
        <View key={to} style={styles.actionButton}>
          <Button
            loading={changeStatus.isPending}
            onPress={() => run(to, label)}
            title={label}
            variant={to === 'closed' ? 'destructive' : 'primary'}
          />
        </View>
      ))}
    </View>
  );
}

// Mirrors the contract's PATCH /tickets/:id body; allowed only while "open".
const editSchema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters').max(120, 'At most 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Describe the problem')
    .max(5000, 'At most 5000 characters'),
});

type EditValues = z.infer<typeof editSchema>;

function EditTicketButton({ ticket }: { ticket: Ticket }) {
  const [open, setOpen] = useState(false);
  const updateTicket = useUpdateTicket(ticket.id);
  const ticketQuery = useTicket(ticket.id);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: ticket.title, description: ticket.description },
  });

  const openModal = () => {
    reset({ title: ticket.title, description: ticket.description });
    setOpen(true);
  };

  const onSave = handleSubmit(async (values) => {
    try {
      await updateTicket.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      showToast(errorMessage(error));
      if (error instanceof ApiRequestError && error.code === 'TICKET_NOT_EDITABLE') {
        // Status moved on under us; resync so the Edit button disappears.
        setOpen(false);
        ticketQuery.refetch();
      }
    }
  });

  return (
    <>
      <Pressable
        accessibilityLabel="Edit ticket"
        accessibilityRole="button"
        onPress={openModal}
        style={styles.editButton}
      >
        <Ionicons color={theme.accent} name="pencil" size={18} />
      </Pressable>
      <Modal
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <Pressable
          accessibilityLabel="Close"
          onPress={() => setOpen(false)}
          style={styles.editBackdrop}
        />
        <View style={styles.editSheet}>
          <Text style={styles.sectionTitle}>Edit ticket</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                error={errors.title?.message}
                label="Title"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                error={errors.description?.message}
                label="Description"
                multiline
                numberOfLines={5}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.editDescription}
                value={value}
              />
            )}
          />
          <Button loading={isSubmitting} onPress={onSave} title="Save changes" />
        </View>
      </Modal>
    </>
  );
}

const EVENT_TEXT: Record<TicketEvent['type'], string> = {
  created: 'created the ticket',
  status_changed: 'changed the status',
  priority_changed: 'changed the priority',
  assigned: 'changed the assignee',
  updated: 'edited the ticket',
  comment_added: 'added a comment',
  attachment_added: 'added an attachment',
};

function ActivitySection({ history }: { history: TicketEvent[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activity</Text>
      {history.map((event) => (
        <Text key={event.id} style={styles.activityLine}>
          {event.actor.name} {EVENT_TEXT[event.type]}
          {event.type === 'status_changed' && typeof event.changes.status?.to === 'string'
            ? ` to ${String(event.changes.status.to).replace('_', ' ')}`
            : ''}{' '}
          · {formatRelative(event.createdAt)}
        </Text>
      ))}
    </View>
  );
}

function Composer({ ticket }: { ticket: Ticket }) {
  const [body, setBody] = useState('');
  const addComment = useAddComment(ticket.id);
  const ticketQuery = useTicket(ticket.id);
  const disabled = ticket.status === 'closed';

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 2000) return;
    try {
      await addComment.mutateAsync(trimmed);
      setBody('');
    } catch (error) {
      showToast(errorMessage(error));
      if (error instanceof ApiRequestError && error.code === 'TICKET_CLOSED') {
        ticketQuery.refetch();
      }
    }
  };

  if (disabled) {
    return (
      <View style={styles.composerClosed}>
        <Text style={styles.composerClosedText}>
          This ticket is closed. Reopen it to add a comment.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.composer}>
      <TextInput
        accessibilityLabel="Add a comment"
        editable={!addComment.isPending}
        maxLength={2000}
        multiline
        onChangeText={setBody}
        placeholder="Add a comment…"
        placeholderTextColor={theme.textMuted}
        style={styles.composerInput}
        value={body}
      />
      <Button
        disabled={body.trim().length === 0}
        loading={addComment.isPending}
        onPress={send}
        title="Send"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  activityLine: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  category: {
    color: theme.textMuted,
    flexShrink: 1,
    fontSize: 14,
  },
  centered: {
    backgroundColor: theme.background,
    flex: 1,
    justifyContent: 'center',
  },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: theme.background,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  composerClosed: {
    backgroundColor: theme.surface,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    padding: 14,
  },
  composerClosedText: {
    color: theme.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  composerInput: {
    borderColor: theme.border,
    borderRadius: 18,
    borderWidth: 1,
    color: theme.text,
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dates: {
    color: theme.textMuted,
    fontSize: 12,
  },
  editBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
  },
  editButton: {
    padding: 6,
  },
  editDescription: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editSheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 14,
    padding: 16,
    paddingBottom: 32,
  },
  description: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingVertical: 12,
  },
  header: {
    gap: 14,
    paddingBottom: 12,
  },
  list: {
    padding: 16,
  },
  noComments: {
    color: theme.textMuted,
    fontSize: 14,
  },
  screen: {
    backgroundColor: theme.surface,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 10,
  },
  skeletons: {
    backgroundColor: theme.surface,
    flex: 1,
    gap: 10,
    padding: 16,
  },
  title: {
    color: theme.text,
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
});
