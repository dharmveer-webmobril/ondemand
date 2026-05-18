export const ROUTINE_MIN_SESSIONS = 2;
export const ROUTINE_MAX_SESSIONS = 24;
export const ROUTINE_MAX_DAYS_AHEAD = 90;
export const ROUTINE_ADVANCE_HOURS = 24;

export type VolumeDiscountTier = {
  minSessions: number;
  maxSessions: number;
  discountPercent: number;
  tier: string;
};

export const VOLUME_DISCOUNT_TIERS: VolumeDiscountTier[] = [
  { minSessions: 2, maxSessions: 3, discountPercent: 5, tier: 'Starter' },
  { minSessions: 4, maxSessions: 7, discountPercent: 10, tier: 'Regular' },
  { minSessions: 8, maxSessions: 11, discountPercent: 15, tier: 'Committed' },
  { minSessions: 12, maxSessions: 17, discountPercent: 20, tier: 'Loyal' },
  { minSessions: 18, maxSessions: 24, discountPercent: 25, tier: 'Champion' },
];

export type RoutineSession = {
  id: string;
  date: string;
  time: string;
};

export function getVolumeDiscountForSessionCount(
  sessionCount: number,
  tiers: VolumeDiscountTier[] = VOLUME_DISCOUNT_TIERS,
): VolumeDiscountTier | null {
  if (sessionCount < ROUTINE_MIN_SESSIONS) return null;
  const table = tiers.length > 0 ? tiers : VOLUME_DISCOUNT_TIERS;
  return (
    table.find(
      (t) => sessionCount >= t.minSessions && sessionCount <= t.maxSessions,
    ) ?? null
  );
}

export function applyVolumeDiscount(
  subtotal: number,
  discountPercent: number,
): { discountAmount: number; total: number } {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const pct = Math.min(100, Math.max(0, discountPercent));
  const discountAmount = safeSubtotal * (pct / 100);
  return {
    discountAmount,
    total: Math.max(0, safeSubtotal - discountAmount),
  };
}

export function addDaysToDateString(dateString: string, days: number): string {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateString: string): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  if (!y || !m || !d) return dateString;
  return `${d}/${m}/${y}`;
}
