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
