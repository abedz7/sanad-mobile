import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useMyTickets } from '../../../src/api/tickets';
import { useAuth } from '../../../src/auth/AuthProvider';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { FadeIn } from '../../../src/components/FadeIn';
import { TicketCardSkeleton } from '../../../src/components/Skeleton';
import { TicketCard } from '../../../src/components/TicketCard';
import { theme } from '../../../src/lib/theme';

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function Greeting({ name }: { name: string | undefined }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroGreeting}>
        {name ? `Hi, ${firstName(name)} 👋` : 'Welcome 👋'}
      </Text>
      <Text style={styles.heroSubtitle}>Here’s what’s happening with your tickets</Text>
    </View>
  );
}

export default function TicketsScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
      <View style={styles.screen}>
        <Greeting name={user?.name} />
        <View style={styles.skeletons}>
          {Array.from({ length: 3 }, (_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.screen}>
        <Greeting name={user?.name} />
        <View style={styles.center}>
          <ErrorState error={error} onRetry={() => refetch()} />
        </View>
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
        ListHeaderComponent={<Greeting name={user?.name} />}
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
          <View style={styles.emptyState}>
            <EmptyState
              icon="ticket-outline"
              title="No tickets yet"
              message="Create your first one and we’ll keep you posted here."
              actionLabel="Create ticket"
              onAction={() => router.push('/(app)/tickets/new')}
            />
          </View>
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
  hero: {
    backgroundColor: theme.accentTint,
    gap: 4,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  heroGreeting: {
    color: theme.text,
    fontSize: 30,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: theme.textMuted,
    fontSize: 15,
  },
  list: {
    padding: 16,
  },
  screen: {
    backgroundColor: theme.surface,
    flex: 1,
  },
  separator: {
    height: 10,
  },
  skeletons: {
    backgroundColor: theme.surface,
    gap: 10,
    padding: 16,
  },
});
