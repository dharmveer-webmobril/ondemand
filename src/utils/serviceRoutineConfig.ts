import {
  ROUTINE_MAX_SESSIONS,
  ROUTINE_MIN_SESSIONS,
  ROUTINE_ADVANCE_HOURS,
  ROUTINE_MAX_DAYS_AHEAD,
  VOLUME_DISCOUNT_TIERS,
  addDaysToDateString,
  type VolumeDiscountTier,
} from '@utils/routineVolumeDiscount';

export type ServiceRoutineConfig = {
  enabled?: boolean;
  maxSessionsPerRoutine?: number;
  maxConcurrentRoutines?: number;
  advanceNoticeHours?: number;
  allowSameDay?: boolean;
  allowCod?: boolean;
  allowOnline?: boolean;
  maxDiscountPctOverride?: number;
  discountTiers?: VolumeDiscountTier[] | null;
};

export function isServiceRoutineEnabled(service: {
  routineConfig?: ServiceRoutineConfig | null;
} | null | undefined): boolean {
  return service?.routineConfig?.enabled === true;
}

/** Routine tab or existing routine sessions — picker allows routine services only. */
export function shouldRestrictServicePickerToRoutine(options: {
  bookingType: 'single' | 'routine';
  routineSessionCount: number;
}): boolean {
  return (
    options.bookingType === 'routine' || options.routineSessionCount > 0
  );
}

/** Single booking: service must list the active delivery preference. */
export function serviceSupportsDeliveryPreference(
  service: { preferences?: string[] | null } | null | undefined,
  deliveryMode: string,
): boolean {
  if (!deliveryMode?.trim()) {
    return true;
  }
  const prefs = service?.preferences;
  if (!Array.isArray(prefs) || prefs.length === 0) {
    return true;
  }
  const mode = deliveryMode.toLowerCase().trim();
  return prefs.some(p => String(p).toLowerCase().trim() === mode);
}

export function formatDeliveryPreferenceLabel(mode: string): string {
  const key = mode?.toLowerCase().trim();
  if (key === 'athome') return 'At home';
  if (key === 'online') return 'Online';
  if (key === 'onpremises') return 'On premises';
  return mode;
}

/** All services in cart must support routine to show routine booking UI. */
export function isCartRoutineEligible(services: unknown[]): boolean {
  const list = Array.isArray(services) ? services : [];
  if (list.length === 0) return false;
  return list.every(s => isServiceRoutineEnabled(s as { routineConfig?: ServiceRoutineConfig }));
}

export function getNonRoutineServicesInCart(
  services: unknown[],
): Array<{ _id?: string; name?: string }> {
  return (Array.isArray(services) ? services : []).filter(
    s => !isServiceRoutineEnabled(s as { routineConfig?: ServiceRoutineConfig }),
  ) as Array<{ _id?: string; name?: string }>;
}

/** Provider offers routine for the active delivery preference. */
export function catalogOffersRoutineBooking(
  catalog: unknown[],
  deliveryMode: string,
): boolean {
  return (Array.isArray(catalog) ? catalog : []).some(s => {
    const svc = s as { routineConfig?: ServiceRoutineConfig; preferences?: string[] };
    return (
      isServiceRoutineEnabled(svc) &&
      serviceSupportsDeliveryPreference(svc, deliveryMode)
    );
  });
}

export function getAggregatedRoutineLimits(services: unknown[]) {
  const routineServices = (Array.isArray(services) ? services : []).filter(s =>
    isServiceRoutineEnabled(s as { routineConfig?: ServiceRoutineConfig }),
  ) as Array<{ routineConfig?: ServiceRoutineConfig }>;

  if (routineServices.length === 0) {
    return {
      maxSessions: ROUTINE_MAX_SESSIONS,
      advanceNoticeHours: ROUTINE_ADVANCE_HOURS,
      allowSameDay: false,
      maxDaysAhead: ROUTINE_MAX_DAYS_AHEAD,
    };
  }

  const maxSessions = Math.min(
    ROUTINE_MAX_SESSIONS,
    ...routineServices.map(
      s => s.routineConfig?.maxSessionsPerRoutine ?? ROUTINE_MAX_SESSIONS,
    ),
  );

  const advanceNoticeHours = Math.max(
    ROUTINE_ADVANCE_HOURS,
    ...routineServices.map(
      s => s.routineConfig?.advanceNoticeHours ?? ROUTINE_ADVANCE_HOURS,
    ),
  );

  const allowSameDay = routineServices.every(
    s => s.routineConfig?.allowSameDay === true,
  );

  return {
    maxSessions,
    advanceNoticeHours,
    allowSameDay,
    maxDaysAhead: ROUTINE_MAX_DAYS_AHEAD,
  };
}

export function getDiscountTiersForServices(
  services: unknown[],
): VolumeDiscountTier[] {
  const routineServices = (Array.isArray(services) ? services : []).filter(s =>
    isServiceRoutineEnabled(s as { routineConfig?: ServiceRoutineConfig }),
  ) as Array<{ routineConfig?: ServiceRoutineConfig }>;

  for (const service of routineServices) {
    const tiers = service.routineConfig?.discountTiers;
    if (Array.isArray(tiers) && tiers.length > 0) {
      return tiers;
    }
  }

  return VOLUME_DISCOUNT_TIERS;
}

export function getRoutineMinDateString(
  todayString: string,
  services: unknown[],
): string {
  const { allowSameDay, advanceNoticeHours } = getAggregatedRoutineLimits(services);

  if (allowSameDay && advanceNoticeHours < 24) {
    return todayString;
  }

  const daysAhead = advanceNoticeHours >= 24 ? 1 : 0;
  return daysAhead > 0 ? addDaysToDateString(todayString, daysAhead) : todayString;
}

export function getRoutineAdvanceNoticeMs(services: unknown[]): number {
  const { advanceNoticeHours } = getAggregatedRoutineLimits(services);
  return Math.max(0, advanceNoticeHours) * 60 * 60 * 1000;
}

export { ROUTINE_MIN_SESSIONS };
