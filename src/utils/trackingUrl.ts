const API_BASE_URL = 'https://squedio.com/api';

const FRONTEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Customer tracking map opened in WebView after link API returns `trackingToken`. */
export function buildMemberTrackingUrl(trackingToken: string): string {
  return `${FRONTEND_ORIGIN}/track/${encodeURIComponent(trackingToken)}`;
}
