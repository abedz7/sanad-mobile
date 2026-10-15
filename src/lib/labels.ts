import type { Priority, Status } from '../types/api';

/**
 * The single source of status/priority display labels and colours.
 * Everything that renders a badge imports from here.
 */

export interface BadgeStyle {
  label: string;
  /** Badge text / accent colour. */
  color: string;
  /** Badge background colour. */
  backgroundColor: string;
}

export const STATUS_LABELS: Record<Status, BadgeStyle> = {
  open: { label: 'Open', color: '#1d4ed8', backgroundColor: '#dbeafe' },
  in_progress: { label: 'In progress', color: '#a16207', backgroundColor: '#fef9c3' },
  resolved: { label: 'Resolved', color: '#15803d', backgroundColor: '#dcfce7' },
  closed: { label: 'Closed', color: '#374151', backgroundColor: '#e5e7eb' },
};

export const PRIORITY_LABELS: Record<Priority, BadgeStyle> = {
  low: { label: 'Low', color: '#374151', backgroundColor: '#f3f4f6' },
  medium: { label: 'Medium', color: '#1d4ed8', backgroundColor: '#dbeafe' },
  high: { label: 'High', color: '#c2410c', backgroundColor: '#ffedd5' },
  urgent: { label: 'Urgent', color: '#b91c1c', backgroundColor: '#fee2e2' },
};

export interface RequesterTransition {
  to: Status;
  label: string;
}

const REOPEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Requester column of the contract's status machine (API.md §5), including the
 * 7-day reopen window after close. A UX hint only — the server still decides.
 */
export function allowedRequesterTransitions(
  status: Status,
  closedAt: string | null,
): RequesterTransition[] {
  switch (status) {
    case 'open':
    case 'in_progress':
      return [{ to: 'closed', label: 'Close ticket' }];
    case 'resolved':
      return [
        { to: 'closed', label: 'Close ticket' },
        { to: 'open', label: 'Reopen — not fixed' },
      ];
    case 'closed': {
      const closedTime = closedAt ? Date.parse(closedAt) : NaN;
      const withinWindow =
        Number.isFinite(closedTime) && Date.now() - closedTime < REOPEN_WINDOW_MS;
      return withinWindow ? [{ to: 'open', label: 'Reopen ticket' }] : [];
    }
  }
}
