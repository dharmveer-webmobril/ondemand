import type { TFunction } from 'i18next';

export function getReferralTriggerLabel(
  trigger: string,
  t: TFunction,
): string {
  const key = `referral.trigger.${trigger}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return trigger.replace(/_/g, ' ');
}

export function getReferralStatusLabel(
  status: string,
  t: TFunction,
): string {
  const key = `referral.status.${status}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return status.replace(/_/g, ' ');
}

export function getReferralInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatReferralDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
