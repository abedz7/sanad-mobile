/**
 * Hand-written from docs/API.md (contract v1.0.0). The contract is the source of
 * truth; this file is the only place its enums live.
 */

export type Role = 'user' | 'admin';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_REFRESH_INVALID'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TICKET_INVALID_TRANSITION'
  | 'TICKET_CLOSED'
  | 'TICKET_NOT_EDITABLE'
  | 'CATEGORY_IN_USE'
  | 'CATEGORY_UNAVAILABLE'
  | 'UPLOAD_REJECTED'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export type ScanStatus = 'pending' | 'clean' | 'skipped';

export type TicketEventType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'updated'
  | 'comment_added'
  | 'attachment_added';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Embedded in tickets, comments and events. */
export interface UserRef {
  id: string;
  name: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** Embedded on tickets; deleted categories may still appear here. */
export interface CategoryRef {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: UserRef;
  scanStatus: ScanStatus;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: CategoryRef;
  priority: Priority;
  status: Status;
  requester: UserRef;
  assignee: UserRef | null;
  attachments: Attachment[];
  commentCount: number;
  lastActivityAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** List endpoints return Ticket minus description/attachments, plus attachmentCount. */
export type TicketListItem = Omit<Ticket, 'description' | 'attachments'> & {
  attachmentCount: number;
};

export interface Comment {
  id: string;
  ticketId: string;
  author: UserRef;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketEvent {
  id: string;
  ticketId: string;
  actor: UserRef;
  type: TicketEventType;
  changes: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}

/** Present only for VALIDATION_FAILED and UPLOAD_REJECTED. */
export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ApiErrorDetail[];
  requestId: string;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type TicketSort =
  | 'createdAt'
  | '-createdAt'
  | 'lastActivityAt'
  | '-lastActivityAt'
  | 'priority'
  | '-priority';
