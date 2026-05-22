/** Routine booking & session status helpers (customer app). */

import { ROUTINE_MIN_SESSIONS } from '@utils/routineVolumeDiscount';

export type RoutineStatusFilter =
  | ''
  | 'pending'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export function normalizeRoutineStatus(status?: string | null): string {
  const raw = String(status || '').toLowerCase().trim();
  if (raw === 'pending_pro_confirmation') return 'pending';
  return raw || 'pending';
}

export function routineStatusMatchesFilter(
  apiStatus: string | undefined | null,
  filter: RoutineStatusFilter,
): boolean {
  if (!filter) return true;
  const normalized = normalizeRoutineStatus(apiStatus);
  if (filter === 'pending') {
    return (
      normalized === 'pending' ||
      String(apiStatus || '').toLowerCase() === 'pending_pro_confirmation'
    );
  }
  if (filter === 'active') {
    return normalized === 'active' || normalized === 'accepted';
  }
  return normalized === filter;
}

export function getRoutineStatusColor(status?: string | null): string {
  const key = normalizeRoutineStatus(status);
  switch (key) {
    case 'pending':
      return '#F5A623';
    case 'accepted':
    case 'active':
      return '#2196F3';
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return '#9E9E9E';
    case 'rejected':
      return '#F44336';
    case 'expired':
      return '#795548';
    default:
      return '#757575';
  }
}

export function formatRoutineStatusLabel(
  status: string | undefined | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const raw = String(status || '').toLowerCase().trim();
  if (raw === 'pending_pro_confirmation') {
    return t('routineBooking.status.awaitingProvider');
  }
  const key = normalizeRoutineStatus(status);
  const i18nKey = `routineBooking.status.${key}`;
  const translated = t(i18nKey);
  return translated === i18nKey
    ? key.replace(/_/g, ' ')
    : translated;
}

export function isRoutineAcceptedByProvider(status?: string | null): boolean {
  const key = normalizeRoutineStatus(status);
  return key === 'accepted' || key === 'active' || key === 'completed';
}

export function getSessionBookingMongoId(session: {
  bookingId?: string | { _id?: string } | null;
}): string | null {
  const bid = session?.bookingId;
  if (bid == null) return null;
  if (typeof bid === 'string' && bid.trim()) return bid.trim();
  if (typeof bid === 'object' && bid._id != null) return String(bid._id).trim();
  return null;
}

export function canViewSessionBookingDetails(
  routineStatus: string | undefined | null,
  session: { bookingId?: string | { _id?: string } | null },
): boolean {
  if (!isRoutineAcceptedByProvider(routineStatus)) return false;
  return !!getSessionBookingMongoId(session);
}

export function normalizeSessionStatus(status?: string | null): string {
  const raw = String(status || '').toLowerCase().trim();
  if (raw === 'pending_materialization') return 'pending';
  return raw || 'pending';
}

export function formatSessionStatusLabel(
  status: string | undefined | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const key = normalizeSessionStatus(status);
  const i18nKey = `routineBooking.sessionStatus.${key}`;
  const translated = t(i18nKey);
  return translated === i18nKey
    ? key.replace(/_/g, ' ')
    : translated;
}

export function isSessionDeletable(
  sessionStatus: string | undefined | null,
): boolean {
  return normalizeSessionStatus(sessionStatus) === 'pending';
}

/** Pending sessions can be removed only while more than `ROUTINE_MIN_SESSIONS` remain. */
export function canDeleteRoutineSession(
  session: { sessionStatus?: string | null },
  totalSessions: number,
): boolean {
  return (
    isSessionDeletable(session.sessionStatus) &&
    totalSessions > ROUTINE_MIN_SESSIONS
  );
}

/** Customer may cancel the whole package while awaiting provider confirmation. */
export function canCancelRoutinePackage(status?: string | null): boolean {
  const raw = String(status || '').toLowerCase().trim();
  return raw === 'pending' || raw === 'pending_pro_confirmation';
}

export function centsToDisplay(
  cents: number | undefined | null,
  currency = 'USD',
): string {
  const amount = Number(cents ?? 0) / 100;
  if (currency.toUpperCase() === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatProRespondBy(iso: string | undefined | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return iso;
  }
}

export function getTimeLeftForProRespond(iso: string | undefined | null): {
  label: string;
  progress: number;
} {
  if (!iso) return { label: '', progress: 0 };
  const end = new Date(iso).getTime();
  const now = Date.now();
  const start = end - 24 * 60 * 60 * 1000;
  const total = end - start;
  const left = Math.max(0, end - now);
  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - left / total)) : 0;

  const hours = Math.floor(left / (60 * 60 * 1000));
  const minutes = Math.floor((left % (60 * 60 * 1000)) / (60 * 1000));
  const label =
    left <= 0
      ? '0m left'
      : hours > 0
        ? `${hours}h ${minutes}m left`
        : `${minutes}m left`;

  return { label, progress };
}
