/** Customer app deep link / universal link configuration (keep in sync with provider share URLs). */
import { BASE_URL, PROFILE_SHARE_HOST } from '@services/api/axiosInstance';

export const APP_LINK_SCHEME = 'squedio';

export const API_BASE_URL = BASE_URL;

/** Web origin without `/api` suffix — used for https:// universal links */
export const WEB_ORIGIN = PROFILE_SHARE_HOST;

/** Prefixes React Navigation / Linking should accept */
export const LINKING_PREFIXES = [
  `${APP_LINK_SCHEME}://`,
  WEB_ORIGIN,
  API_BASE_URL,
] as const;

/**
 * HTTPS API path (legacy / backend).
 * Only `providerId` (service provider Mongo `_id`, 24-char hex) is required.
 */
export function buildProviderProfileShareUrl(providerId: string): string {
  const id = String(providerId || '').trim();
  if (!id) return '';
  return `${API_BASE_URL}/v1/profile/share/${encodeURIComponent(id)}`;
}

/** Custom scheme — opens the customer app directly. */
export function buildProviderProfileAppLink(providerId: string): string {
  const id = String(providerId || '').trim();
  if (!id) return '';
  return `${APP_LINK_SCHEME}://profile/${encodeURIComponent(id)}`;
}

/**
 * Web share URL — opens `/profile-share`, which forwards to the customer app deep link.
 * Example: https://host:port/profile-share?link=squedio://profile/{id}
 */
export function buildProviderProfileShareLink(providerId: string): string {
  const deepLink = buildProviderProfileAppLink(providerId);
  if (!deepLink) return '';
  const params = new URLSearchParams({ link: deepLink });
  return `${PROFILE_SHARE_HOST}/profile-share?${params.toString()}`;
}

/** Custom scheme — opens signup with referral code. */
export function buildReferralSignupAppLink(referralCode: string): string {
  const code = String(referralCode || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);
  if (code.length !== 8) return '';
  const params = new URLSearchParams({
    role: 'customer',
    ref: code,
  });
  return `${APP_LINK_SCHEME}://signup?${params.toString()}`;
}

/**
 * Web share URL — opens `/referral-share`, which forwards to the customer app signup deep link.
 * Example: https://host:port/referral-share?link=squedio://signup?role=customer&ref=CODE
 */
export function buildReferralShareLink(referralCode: string): string {
  const deepLink = buildReferralSignupAppLink(referralCode);
  if (!deepLink) return '';
  const params = new URLSearchParams({ link: deepLink });
  return `${PROFILE_SHARE_HOST}/referral-share?${params.toString()}`;
}
