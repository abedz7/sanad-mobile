import { useInfiniteQuery } from '@tanstack/react-query';

import { api } from './client';
import type { Paginated, Priority, Status, TicketListItem } from '../types/api';

export interface TicketListFilters {
  status?: Status;
  priority?: Priority;
  limit?: number;
}

const DEFAULT_LIMIT = 20;

async function fetchMyTickets(
  page: number,
  { status, priority, limit = DEFAULT_LIMIT }: TicketListFilters,
): Promise<Paginated<TicketListItem>> {
  const response = await api.get<Paginated<TicketListItem>>('/tickets', {
    params: { page, limit, ...(status && { status }), ...(priority && { priority }) },
  });
  return response.data;
}

export const ticketKeys = {
  all: ['tickets'] as const,
  list: (filters: TicketListFilters) => ['tickets', 'list', filters] as const,
};

/** Infinite list of the caller's own tickets; server default sort -lastActivityAt. */
export function useMyTickets(filters: TicketListFilters = {}) {
  return useInfiniteQuery({
    queryKey: ticketKeys.list(filters),
    queryFn: ({ pageParam }) => fetchMyTickets(pageParam, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}
