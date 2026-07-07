import { Linking } from 'react-native';
import i18next from 'i18next';
import { showToast } from '@components/common/CustomToast';
import { store } from '@store/index';
import { navigate, navigationRef } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { isGuestUser } from '@utils/guest/guestAuth';

export type ReferralDeepLinkParams = {
  ref: string;
  role?: string;
};

let pendingReferralCode: string | null = null;

function normalizeReferralCode(value: string): string {
  return String(value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);
}

function parseReferralCodeFromRaw(raw: string): string | null {
  const refMatch = raw.match(/[?&]ref=([A-Za-z0-9]+)/i);
  if (!refMatch?.[1]) return null;
  const code = normalizeReferralCode(refMatch[1]);
  return code.length === 8 ? code : null;
}

/**
 * Extract referral signup params from shared referral / deep link URLs.
 *
 * Supported formats:
 * - https://host:port/referral-share?link=squedio://signup?role=customer&ref=CODE
 * - https://host:port/referral-share?squedio://signup?role=customer&ref=CODE
 * - squedio://signup?role=customer&ref=CODE
 */
export function parseReferralShareUrl(
  url: string | null | undefined,
): ReferralDeepLinkParams | null {
  const raw = String(url || '').trim();
  if (!raw) return null;

  const isReferralContext =
    /referral-share/i.test(raw) ||
    /^squedio:\/\/signup/i.test(raw) ||
    /(?:^|\/)signup(?:\?|$|\/)/i.test(raw);

  if (!isReferralContext) return null;

  const linkParamMatch = raw.match(/[?&]link=([^&]+)/i);
  if (linkParamMatch?.[1]) {
    const fromLink = parseReferralShareUrl(decodeURIComponent(linkParamMatch[1]));
    if (fromLink) return fromLink;
  }

  const ref = parseReferralCodeFromRaw(raw);
  if (ref) {
    const roleMatch = raw.match(/[?&]role=([^&]+)/i);
    const role = roleMatch?.[1]
      ? decodeURIComponent(roleMatch[1]).trim()
      : undefined;
    if (role && role !== 'customer') return null;
    return { ref, role };
  }

  try {
    const u = new URL(raw, 'https://app.local');
    const refParam = u.searchParams.get('ref');
    if (refParam) {
      const code = normalizeReferralCode(refParam);
      if (code.length === 8) {
        const role = u.searchParams.get('role') || undefined;
        if (role && role !== 'customer') return null;
        return { ref: code, role };
      }
    }

    const nestedLink = u.searchParams.get('link');
    if (nestedLink) {
      const fromNested = parseReferralShareUrl(nestedLink);
      if (fromNested) return fromNested;
    }
  } catch {
    // fall through
  }

  return null;
}

export function setPendingReferralDeepLink(ref: string): void {
  const code = normalizeReferralCode(ref);
  if (code.length === 8) pendingReferralCode = code;
}

export function clearPendingReferralDeepLink(): void {
  pendingReferralCode = null;
}

export function hasPendingReferralDeepLink(): boolean {
  return !!pendingReferralCode;
}

export function captureReferralShareUrl(
  url: string | null | undefined,
): boolean {
  const parsed = parseReferralShareUrl(url);
  if (!parsed?.ref) return false;
  setPendingReferralDeepLink(parsed.ref);
  return true;
}

function isFullyAuthenticatedCustomer(): boolean {
  const { isAuthenticated: authed, token, userDetails, isGuest } =
    store.getState().auth;
  return !!authed && !!token && !isGuestUser(userDetails, isGuest);
}

function showExistingAccountReferralToast(): void {
  showToast({
    type: 'info',
    title: i18next.t('referral.deepLinkTitle'),
    message: i18next.t('referral.existingAccountOnly'),
  });
}

function getCurrentRouteName(): string | undefined {
  if (!navigationRef.isReady()) return undefined;
  return navigationRef.getCurrentRoute()?.name;
}

/**
 * Opens signup with referral code, or home + info toast for existing users.
 * Returns true if navigation was performed.
 */
export function tryOpenPendingReferralDeepLink(): boolean {
  const ref = pendingReferralCode;
  if (!ref || !navigationRef.isReady()) {
    return false;
  }

  pendingReferralCode = null;
  const currentRoute = getCurrentRouteName();

  if (isFullyAuthenticatedCustomer()) {
    showExistingAccountReferralToast();
    if (currentRoute !== SCREEN_NAMES.HOME) {
      navigate(SCREEN_NAMES.HOME);
    }
    return true;
  }

  if (currentRoute === SCREEN_NAMES.SIGNUP) {
    return true;
  }

  navigate(SCREEN_NAMES.SIGNUP, { ref });
  return true;
}

/**
 * Handle an incoming referral deep link (warm start or foreground).
 * Stores pending ref for after splash/auth when navigation is not ready.
 */
export function handleReferralDeepLink(
  url: string | null | undefined,
): boolean {
  const parsed = parseReferralShareUrl(url);
  if (!parsed?.ref) return false;

  setPendingReferralDeepLink(parsed.ref);

  if (navigationRef.isReady()) {
    return tryOpenPendingReferralDeepLink();
  }

  return true;
}
