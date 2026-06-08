import { Linking } from 'react-native';
import { store } from '@store/index';
import { navigationRef } from '@utils/NavigationUtils';
import {
  navigateFromAssistantUrl,
  navigateToAssistantProvider,
} from '@utils/aiAssistantNavigation';

const PROVIDER_ID_RE = /([a-f\d]{24})/i;

let pendingProviderSpId: string | null = null;

/**
 * Extract service-provider id from shared profile / deep link URLs.
 *
 * Supported formats:
 * - https://host:port/profile-share?link=squedio://profile/{providerId}
 * - https://host:port/api/v1/profile/share/{providerId}
 * - squedio://profile/{providerId}
 * - https://host/.../customer/provider/{providerId}
 */
export function parseProviderProfileShareUrl(
  url: string | null | undefined,
): string | null {
  const raw = String(url || '').trim();
  if (!raw) return null;

  // profile-share?link=squedio://profile/{id}
  const linkParamMatch = raw.match(/[?&]link=([^&]+)/i);
  if (linkParamMatch?.[1]) {
    const decoded = decodeURIComponent(linkParamMatch[1]);
    const fromLink = parseProviderProfileShareUrl(decoded);
    if (fromLink) return fromLink;
  }

  const patterns = [
    /\/v1\/profile\/share\/([a-f\d]{24})/i,
    /\/api\/v1\/profile\/share\/([a-f\d]{24})/i,
    /\/customer\/provider\/([a-f\d]{24})/i,
    /^squedio:\/\/profile\/([a-f\d]{24})/i,
    /^squedio:\/\/provider\/([a-f\d]{24})/i,
    // Paths passed by React Navigation linking (scheme stripped)
    /^profile\/([a-f\d]{24})/i,
    /^provider\/([a-f\d]{24})/i,
    /^\/profile\/([a-f\d]{24})/i,
    /^\/provider\/([a-f\d]{24})/i,
  ];

  for (const re of patterns) {
    const m = raw.match(re);
    if (m?.[1]) return m[1];
  }

  try {
    const u = new URL(raw, 'https://app.local');
    const pathMatch = u.pathname.match(
      /\/(?:api\/)?v1\/profile\/share\/([a-f\d]{24})/i,
    );
    if (pathMatch?.[1]) return pathMatch[1];

    const customerMatch = u.pathname.match(
      /\/customer\/provider\/([a-f\d]{24})/i,
    );
    if (customerMatch?.[1]) return customerMatch[1];

    const host = u.hostname?.toLowerCase();
    if (host === 'profile' || host === 'provider') {
      const seg = u.pathname.replace(/^\//, '').split('/')[0];
      if (seg && PROVIDER_ID_RE.test(seg)) return seg.match(PROVIDER_ID_RE)?.[1] ?? null;
    }

    const nestedLink = u.searchParams.get('link');
    if (nestedLink) {
      const fromNested = parseProviderProfileShareUrl(nestedLink);
      if (fromNested) return fromNested;
    }

    const qp = u.searchParams.get('spId') || u.searchParams.get('providerId');
    if (qp && PROVIDER_ID_RE.test(qp)) return qp.match(PROVIDER_ID_RE)?.[1] ?? null;
  } catch {
    // fall through
  }

  return null;
}

export function setPendingProviderProfileDeepLink(spId: string): void {
  const id = String(spId || '').trim();
  if (id) pendingProviderSpId = id;
}

export function clearPendingProviderProfileDeepLink(): void {
  pendingProviderSpId = null;
}

export function hasPendingProviderProfileDeepLink(): boolean {
  return !!pendingProviderSpId;
}

/** Store spId from URL for navigation after splash / login */
export function captureProviderProfileUrl(
  url: string | null | undefined,
): boolean {
  const spId = parseProviderProfileShareUrl(url);
  if (!spId) return false;
  setPendingProviderProfileDeepLink(spId);
  return true;
}

function isAuthenticated(): boolean {
  const { isAuthenticated: authed, token } = store.getState().auth;
  return !!authed && !!token;
}

/**
 * Opens provider detail when user is logged in and navigation is ready.
 * Returns true if navigation was performed.
 */
export function tryOpenPendingProviderProfile(): boolean {
  const spId = pendingProviderSpId;
  if (!spId || !isAuthenticated() || !navigationRef.isReady()) {
    return false;
  }
  pendingProviderSpId = null;
  navigateToAssistantProvider(spId);
  return true;
}

/**
 * Handle an incoming profile deep link (warm start or foreground).
 * If not logged in, stores pending spId for after auth.
 */
export function handleProviderProfileDeepLink(
  url: string | null | undefined,
): boolean {
  const spId = parseProviderProfileShareUrl(url);
  if (!spId) return false;

  if (isAuthenticated() && navigationRef.isReady()) {
    pendingProviderSpId = null;
    navigateToAssistantProvider(spId);
    return true;
  }

  setPendingProviderProfileDeepLink(spId);
  return true;
}

/** Call once on app start to capture cold-start deep link URL */
export async function captureInitialProviderProfileUrl(): Promise<void> {
  try {
    const url = await Linking.getInitialURL();
    if (url) captureProviderProfileUrl(url);
  } catch {
    // ignore
  }
}

/** Subscribe to profile + assistant URLs while app is running */
export function subscribeToAppDeepLinks(): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (handleProviderProfileDeepLink(url)) return;
    navigateFromAssistantUrl(url);
  });
  return () => subscription.remove();
}

/** Navigate to provider details (alias used after auth flows) */
export function openProviderProfileById(spId: string): void {
  if (!spId?.trim()) return;
  if (isAuthenticated() && navigationRef.isReady()) {
    navigateToAssistantProvider(spId.trim());
    return;
  }
  setPendingProviderProfileDeepLink(spId.trim());
}
