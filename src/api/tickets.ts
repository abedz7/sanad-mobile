import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';

import { api } from './client';
import type {
  ApiSuccess,
  Attachment,
  Comment,
  Paginated,
  Priority,
  Status,
  Ticket,
  TicketEvent,
  TicketListItem,
} from '../types/api';

export interface TicketListFilters {
  status?: Status;
  priority?: Priority;
  limit?: number;
}

const DEFAULT_LIMIT = 20;

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => ['tickets', 'list'] as const,
  list: (filters: TicketListFilters) => ['tickets', 'list', filters] as const,
  detail: (id: string) => ['tickets', 'detail', id] as const,
  comments: (id: string) => ['tickets', 'detail', id, 'comments'] as const,
  history: (id: string) => ['tickets', 'detail', id, 'history'] as const,
  attachmentFile: (ticketId: string, attachmentId: string) =>
    ['tickets', 'detail', ticketId, 'attachment-file', attachmentId] as const,
};

// ---------------------------------------------------------------------------
// List

async function fetchMyTickets(
  page: number,
  { status, priority, limit = DEFAULT_LIMIT }: TicketListFilters,
): Promise<Paginated<TicketListItem>> {
  const response = await api.get<Paginated<TicketListItem>>('/tickets', {
    params: { page, limit, ...(status && { status }), ...(priority && { priority }) },
  });
  return response.data;
}

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

// ---------------------------------------------------------------------------
// Detail

async function fetchTicket(id: string): Promise<Ticket> {
  const response = await api.get<ApiSuccess<Ticket>>(`/tickets/${id}`);
  return response.data.data;
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => fetchTicket(id),
  });
}

// ---------------------------------------------------------------------------
// Create / edit / status

export interface CreateTicketInput {
  title: string;
  description: string;
  categoryId: string;
  priority?: Priority;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const response = await api.post<ApiSuccess<Ticket>>('/tickets', input);
  return response.data.data;
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
}

/** Requester edit — the server allows this only while status is "open". */
export function useUpdateTicket(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTicketInput) => {
      const response = await api.patch<ApiSuccess<Ticket>>(`/tickets/${id}`, input);
      return response.data.data;
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketKeys.detail(id), ticket);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

/** Offers only client-filtered transitions, but the server always decides. */
export function useChangeStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: Status) => {
      const response = await api.post<ApiSuccess<Ticket>>(`/tickets/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketKeys.detail(id), ticket);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.history(id) });
    },
  });
}

// ---------------------------------------------------------------------------
// Comments

async function fetchComments(
  ticketId: string,
  page: number,
): Promise<Paginated<Comment>> {
  const response = await api.get<Paginated<Comment>>(`/tickets/${ticketId}/comments`, {
    params: { page, limit: DEFAULT_LIMIT },
  });
  return response.data;
}

/** Oldest first (fixed by the server); pages append chronologically. */
export function useTicketComments(ticketId: string) {
  return useInfiniteQuery({
    queryKey: ticketKeys.comments(ticketId),
    queryFn: ({ pageParam }) => fetchComments(ticketId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}

export function useAddComment(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const response = await api.post<ApiSuccess<Comment>>(`/tickets/${ticketId}/comments`, {
        body,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.comments(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// History

export function useTicketHistory(ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.history(ticketId),
    queryFn: async (): Promise<TicketEvent[]> => {
      const response = await api.get<ApiSuccess<TicketEvent[]>>(`/tickets/${ticketId}/history`);
      return response.data.data;
    },
  });
}

// ---------------------------------------------------------------------------
// Attachments

export interface LocalFile {
  uri: string;
  name: string;
  type: string;
}

/**
 * Uploads one file as multipart field "file". Content-Type is left to the
 * runtime so the multipart boundary is set correctly.
 */
export async function uploadAttachment(
  ticketId: string,
  file: LocalFile,
  onProgress?: (fraction: number) => void,
): Promise<Attachment> {
  const form = new FormData();
  // React Native's FormData takes a {uri, name, type} descriptor for files.
  form.append('file', file as unknown as Blob);
  const response = await api.post<ApiSuccess<Attachment>>(
    `/tickets/${ticketId}/attachments`,
    form,
    {
      // Clear the instance's default application/json so the runtime sets
      // multipart/form-data with the boundary; otherwise the server sees a
      // JSON-labelled body, finds no file, and rejects the upload.
      headers: { 'Content-Type': undefined },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(event.loaded / event.total);
      },
    },
  );
  return response.data.data;
}

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Downloads an attachment through the authenticated API (bearer token via the
 * axios instance — never a raw URL) into the app cache and returns the local
 * file URI. The cache name is random; nothing user-controlled reaches the path.
 */
export async function downloadAttachment(
  ticketId: string,
  attachment: Attachment,
): Promise<string> {
  const response = await api.get<ArrayBuffer>(
    `/tickets/${ticketId}/attachments/${attachment.id}/download`,
    { responseType: 'arraybuffer' },
  );
  const extension = EXTENSION_BY_MIME[attachment.mimeType] ?? 'bin';
  const name = `attachment-${Math.random().toString(36).slice(2)}.${extension}`;
  const file = new File(Paths.cache, name);
  file.write(new Uint8Array(response.data));
  return file.uri;
}

/** Cached per attachment id so each file is downloaded once per session. */
export function useAttachmentFile(ticketId: string, attachment: Attachment) {
  return useQuery({
    queryKey: ticketKeys.attachmentFile(ticketId, attachment.id),
    queryFn: () => downloadAttachment(ticketId, attachment),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
