const API_BASE_URL = 'https://indoredev.webmobrildemo.com:10054/api';

const FRONTEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Customer tracking map opened in WebView after link API returns `trackingToken`. */
export function buildMemberTrackingUrl(trackingToken: string): string {
  return `${FRONTEND_ORIGIN}/frontend/track/${encodeURIComponent(trackingToken)}`;
}
