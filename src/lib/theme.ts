/**
 * Brand tokens. `accent` is the single accent colour (sampled from the logo
 * mark); `accentTint` is for selected/hover backgrounds, `accentShade` for
 * pressed states. Status and priority colours live in labels.ts on purpose —
 * they must never look like interactive elements.
 */

export const theme = {
  accent: '#187375',
  accentTint: '#e8f1f1',
  accentShade: '#115052',

  text: '#111827',
  textMuted: '#6b7280',
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  danger: '#b91c1c',
  dangerTint: '#fee2e2',
} as const;
