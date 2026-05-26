import SCREEN_NAMES from '@navigation/ScreenNames';
import { navigate } from '@utils/NavigationUtils';

export type ParsedAssistantLink =
  | {
      type: 'book';
      serviceId: string;
      spId: string;
      date?: string;
      time?: string;
      preference?: string;
    }
  | { type: 'provider'; spId: string };

/** Map web book/provider URLs to native navigation params */
export function parseAssistantUrl(url: string): ParsedAssistantLink | null {
  const raw = String(url || '').trim();
  if (!raw) return null;

  try {
    const u = new URL(raw, 'https://app.local');
    const path = u.pathname;

    const bookMatch = path.match(
      /\/customer\/book-service\/([a-f\d]{24})/i,
    );
    if (bookMatch) {
      return {
        type: 'book',
        serviceId: bookMatch[1],
        spId: u.searchParams.get('spId') || '',
        date: u.searchParams.get('date') || undefined,
        time: u.searchParams.get('time') || undefined,
        preference: u.searchParams.get('preference') || undefined,
      };
    }

    const providerMatch = path.match(/\/customer\/provider\/([a-f\d]{24})/i);
    if (providerMatch) {
      return { type: 'provider', spId: providerMatch[1] };
    }
  } catch {
    const bookRaw = raw.match(
      /\/customer\/book-service\/([a-f\d]{24})(?:\?([^#]*))?/i,
    );
    if (bookRaw) {
      const qs = bookRaw[2] || '';
      const params = new URLSearchParams(qs);
      return {
        type: 'book',
        serviceId: bookRaw[1],
        spId: params.get('spId') || '',
        date: params.get('date') || undefined,
        time: params.get('time') || undefined,
        preference: params.get('preference') || undefined,
      };
    }
    const providerRaw = raw.match(/\/customer\/provider\/([a-f\d]{24})/i);
    if (providerRaw) {
      return { type: 'provider', spId: providerRaw[1] };
    }
  }

  return null;
}

export function navigateToAssistantProvider(spId: string): void {
  if (!spId?.trim()) return;
  navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
    provider: { id: spId.trim() },
    prevScreenFlag: 'without_data',
  });
}

export function navigateFromAssistantUrl(url: string): boolean {
  const parsed = parseAssistantUrl(url);
  if (!parsed) return false;

  if (parsed.type === 'provider') {
    navigateToAssistantProvider(parsed.spId);
    return true;
  }

  if (!parsed.spId) return false;

  navigateToAssistantProvider(parsed.spId);
  return true;
}

/** Map service display name (lowercase) → provider spId from book/provider actions and markdown links. */
export function buildServiceProviderMap(
  actions: { type?: string; label?: string; url?: string }[],
  content: string,
): Map<string, string> {
  const map = new Map<string, string>();

  const add = (name: string, spId: string) => {
    const key = name.trim().toLowerCase();
    if (key && spId && !map.has(key)) {
      map.set(key, spId);
    }
  };

  const serviceNameFromBookLabel = (label: string) =>
    label.replace(/^book\s+/i, '').trim();

  for (const action of actions || []) {
    if (!action?.url) continue;
    const parsed = parseAssistantUrl(action.url);
    if (!parsed) continue;

    if (action.type === 'provider' && parsed.type === 'provider') {
      if (action.label) add(action.label, parsed.spId);
    }

    if (action.type === 'book' && parsed.type === 'book' && parsed.spId) {
      const name = serviceNameFromBookLabel(action.label || '');
      if (name) add(name, parsed.spId);
    }
  }

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(content)) !== null) {
    const parsed = parseAssistantUrl(match[2]);
    if (parsed?.type === 'book' && parsed.spId) {
      const name = serviceNameFromBookLabel(match[1]);
      if (name) add(name, parsed.spId);
    }
  }

  return map;
}
