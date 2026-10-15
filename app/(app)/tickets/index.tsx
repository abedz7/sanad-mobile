import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { useMyTickets } from '../../../src/api/tickets';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { FadeIn } from '../../../src/components/FadeIn';
import { TicketCardSkeleton } from '../../../src/components/Skeleton';
import { TicketCard } from '../../../src/components/TicketCard';
import { theme } from '../../../src/lib/theme';

export default function TicketsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data,
    error,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyTickets();

  const tickets = data?.pages.flatMap((page) => page.data) ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isPending) {
    return (
      <View style={styles.skeletons}>
        {Array.from({ length: 3 }, (_, i) => (
          <TicketCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <ErrorState error={error} onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <FadeIn>
      <FlatList
        contentContainerStyle={tickets.length === 0 ? styles.emptyContainer : styles.list}
        data={tickets}
        keyExtractor={(ticket) => ticket.id}
        renderItem={({ item }) => (
          <TicketCard
            onPress={() => router.push(`/(app)/tickets/${item.id}`)}
            ticket={item}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            colors={[theme.accent]}
            tintColor={theme.accent}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title="No tickets yet"
            message="Create your first one and we’ll keep you posted here."
            actionLabel="Create ticket"
            onAction={() => router.push('/(app)/tickets/new')}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={theme.accent} style={styles.footer} />
          ) : null
        }
        style={styles.screen}
      />
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  center: {
    backgroundColor: theme.surface,
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
  list: {
    padding: 16,
  },
  screen: {
    backgroundColor: theme.surface,
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
});
