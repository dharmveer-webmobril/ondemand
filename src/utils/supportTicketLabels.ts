export type SupportTicketStatusKey =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export const SUPPORT_TICKET_STATUS_ORDER: SupportTicketStatusKey[] = [
  'open',
  'in_progress',
  'resolved',
  'closed',
];

export function normalizeSupportTicketStatus(
  status?: string | null,
): SupportTicketStatusKey {
  const raw = String(status || 'open')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
  if (raw === 'inprogress') return 'in_progress';
  if (
    raw === 'open' ||
    raw === 'in_progress' ||
    raw === 'resolved' ||
    raw === 'closed'
  ) {
    return raw;
  }
  return 'open';
}

export function getSupportStatusLabelKey(status?: string | null): string {
  return `supportTickets.status.${normalizeSupportTicketStatus(status)}`;
}

export function getSupportPriorityLabelKey(priority?: string | null): string {
  const p = String(priority || 'medium').toLowerCase();
  if (p === 'low' || p === 'medium' || p === 'high') {
    return `supportTickets.priority.${p}`;
  }
  return `supportTickets.priority.medium`;
}

export function supportStatusStyle(status: string | undefined, theme: any) {
  const s = normalizeSupportTicketStatus(status);
  if (s === 'open')
    return {
      bg: 'rgba(19,93,150,0.12)',
      color: theme.colors.primary || '#135D96',
      border: theme.colors.primary || '#135D96',
    };
  if (s === 'in_progress')
    return {
      bg: 'rgba(234,179,8,0.15)',
      color: theme.colors.warningColor || '#ca8a04',
      border: theme.colors.warningColor || '#ca8a04',
    };
  if (s === 'resolved')
    return {
      bg: 'rgba(34,197,94,0.12)',
      color: '#16a34a',
      border: '#16a34a',
    };
  return {
    bg: 'rgba(107,114,128,0.12)',
    color: '#6b7280',
    border: '#9ca3af',
  };
}

export function supportPriorityStyle(priority: string | undefined) {
  const p = String(priority || 'medium').toLowerCase();
  if (p === 'high')
    return { bg: '#dc2626', color: '#ffffff' };
  if (p === 'low')
    return { bg: 'rgba(107,114,128,0.15)', color: '#4b5563' };
  return { bg: 'rgba(234,179,8,0.2)', color: '#a16207' };
}

export function formatSupportTicketDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusStepIndex(status?: string | null): number {
  return SUPPORT_TICKET_STATUS_ORDER.indexOf(
    normalizeSupportTicketStatus(status),
  );
}
