/** Routine booking & session status helpers (customer app). */

import { ROUTINE_MIN_SESSIONS } from '@utils/routineVolumeDiscount';
import { formatAmount } from '@utils/formatAmount';
import { getSelectedAddOnPricing } from '@screens/booking/checkoutHelpers';

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
  return formatAmount(amount);
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

export type RoutineServiceAddonLine = {
  name: string;
  quantity: number;
  lineTotal: number;
};

export type RoutineServiceDetailDisplay = {
  serviceId: string;
  name: string;
  price: number;
  durationMinutes?: number;
  addOns: RoutineServiceAddonLine[];
  addOnsTotal: number;
  perSessionSubtotal: number;
};

function resolveRoutineAddonLine(item: any): RoutineServiceAddonLine | null {
  if (item == null) return null;

  const nested = item?.addon ?? item?.addOn ?? item?.addOnId;
  const name =
    (typeof nested === 'object' && nested != null ? nested?.name : null) ??
    item?.name ??
    'Add-on';
  const qty = Math.max(1, Math.floor(Number(item?.quantity) || 1));

  const lineFromApi = Number(item?.lineAmount ?? item?.amount);
  if (Number.isFinite(lineFromApi) && lineFromApi >= 0) {
    return { name: String(name), quantity: qty, lineTotal: lineFromApi };
  }

  const pricingSource =
    typeof nested === 'object' && nested != null
      ? { ...nested, quantity: qty }
      : {
          price: Number(item?.unitAmount ?? item?.price) || 0,
          discountPercentage: item?.discountPercentage,
          quantity: qty,
        };

  return {
    name: String(name),
    quantity: qty,
    lineTotal: getSelectedAddOnPricing(pricingSource).lineTotal,
  };
}

function collectRoutineAddonLines(source: any): RoutineServiceAddonLine[] {
  if (!source) return [];

  const candidates = [
    source.addOnServices,
    source.addons,
    source.addOns,
    source.addonItems,
  ];

  for (const list of candidates) {
    if (!Array.isArray(list) || list.length === 0) continue;
    const lines = list
      .map(resolveRoutineAddonLine)
      .filter((line): line is RoutineServiceAddonLine => line != null);
    if (lines.length > 0) return lines;
  }

  return [];
}

/** Merge API `servicesDetail` with `routineBooking.services` (addonItems + quantities). */
export function mapRoutineServicesForDisplay(
  servicesDetail: any[] = [],
  routineServices: any[] = [],
): RoutineServiceDetailDisplay[] {
  const routineByServiceId = new Map<string, any>();
  for (const rs of routineServices) {
    const id = String(rs?.serviceId?._id ?? rs?.serviceId ?? '').trim();
    if (id) routineByServiceId.set(id, rs);
  }

  const hasDetail = Array.isArray(servicesDetail) && servicesDetail.length > 0;
  const sourceRows = hasDetail
    ? servicesDetail
    : routineServices.map((rs: any, index: number) => {
        const serviceObj =
          typeof rs?.serviceId === 'object' ? rs.serviceId : null;
        const serviceId = String(
          serviceObj?._id ?? rs?.serviceId ?? `service-${index}`,
        );
        return {
          serviceId,
          name: serviceObj?.name ?? 'Service',
          price: Number(serviceObj?.price) || 0,
          durationMinutes: serviceObj?.time ?? serviceObj?.duration,
          addonItems: rs?.addonItems,
          addOnServices: rs?.addOnServices,
        };
      });

  return sourceRows.map((svc: any, index: number) => {
    const serviceId = String(svc?.serviceId ?? svc?._id ?? `service-${index}`);
    const routineSvc = routineByServiceId.get(serviceId);
    const merged = {
      ...routineSvc,
      ...svc,
      addonItems: svc?.addonItems ?? routineSvc?.addonItems,
      addOnServices: svc?.addOnServices ?? routineSvc?.addOnServices,
    };

    const basePrice =
      Number(svc?.price ?? svc?.servicePrice) ||
      Number(
        typeof routineSvc?.serviceId === 'object'
          ? routineSvc.serviceId?.price
          : 0,
      ) ||
      0;
    const addOns = collectRoutineAddonLines(merged);
    const addOnsTotal = addOns.reduce((sum, line) => sum + line.lineTotal, 0);

    return {
      serviceId,
      name: String(svc?.name ?? 'Service'),
      price: Number.isFinite(basePrice) ? basePrice : 0,
      durationMinutes:
        Number(svc?.durationMinutes ?? svc?.time) || undefined,
      addOns,
      addOnsTotal,
      perSessionSubtotal:
        (Number.isFinite(basePrice) ? basePrice : 0) + addOnsTotal,
    };
  });
}

export function sumRoutinePerSessionSubtotal(
  services: RoutineServiceDetailDisplay[],
): number {
  return services.reduce((sum, svc) => sum + svc.perSessionSubtotal, 0);
}

export function sumRoutineServicesBaseAmount(
  services: RoutineServiceDetailDisplay[],
): number {
  return services.reduce((sum, svc) => sum + svc.price, 0);
}

export function sumRoutineAddOnsAmount(
  services: RoutineServiceDetailDisplay[],
): number {
  return services.reduce((sum, svc) => sum + svc.addOnsTotal, 0);
}

export type RoutinePaymentBreakdownDisplay = {
  servicesAmount: number;
  addOnsAmount: number;
  perSessionSubtotal: number;
  sessionCount: number;
  packageSubtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
};

/** Client-side breakdown; prefers API cents for package subtotal, discount, and total when present. */
export function buildRoutinePaymentBreakdown(
  services: RoutineServiceDetailDisplay[],
  pricing?: {
    sessionCount?: number;
    subtotalCents?: number;
    discountAmountCents?: number;
    totalCents?: number;
    currency?: string;
  } | null,
  sessionCountFallback = 1,
): RoutinePaymentBreakdownDisplay {
  const servicesAmount = sumRoutineServicesBaseAmount(services);
  const addOnsAmount = sumRoutineAddOnsAmount(services);
  const perSessionSubtotal = sumRoutinePerSessionSubtotal(services);
  const sessionCount = Math.max(
    1,
    Number(pricing?.sessionCount) || sessionCountFallback || 1,
  );
  const currency = pricing?.currency || 'USD';
  const computedPackage = perSessionSubtotal * sessionCount;
  const packageSubtotal =
    pricing?.subtotalCents != null
      ? Number(pricing.subtotalCents) / 100
      : computedPackage;
  const totalFromApi =
    pricing?.totalCents != null ? Number(pricing.totalCents) / 100 : null;
  const discountAmount =
    pricing?.discountAmountCents != null
      ? Number(pricing.discountAmountCents) / 100
      : totalFromApi != null
        ? Math.max(0, packageSubtotal - totalFromApi)
        : 0;
  const total = totalFromApi ?? Math.max(0, packageSubtotal - discountAmount);

  return {
    servicesAmount,
    addOnsAmount,
    perSessionSubtotal,
    sessionCount,
    packageSubtotal,
    discountAmount,
    total,
    currency,
  };
}
