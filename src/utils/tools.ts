import { Colors } from './theme';
import { Platform, Alert } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

const formatBookingAddress = (booking: any): string => {
  if (booking.addressId) {
    const addr = booking.addressId;
    const parts = [addr.line1];
    if (addr.line2) parts.push(addr.line2);
    if (addr.landmark) parts.push(addr.landmark);
    return parts.join(', ');
  }
  return 'Address not available';
};

// Map API booking status to display-friendly status
type DisplayStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'ONTHEWAY'
  | 'REACHED'
  | 'ONGOING'
  | 'COMPLETED';
type ListStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

const mapBookingStatusToDisplay = (status: string): DisplayStatus => {
  const statusMap: Record<string, DisplayStatus> = {
    requested: 'REQUESTED',
    accepted: 'ACCEPTED',
    rejected: 'REJECTED',
    rescheduledByCustomer: 'RESCHEDULED',
    rescheduledBySp: 'RESCHEDULED',
    cancelledByCustomer: 'CANCELLED',
    cancelledBySp: 'CANCELLED',
    ontheway: 'ONTHEWAY',
    reached: 'REACHED',
    ongoing: 'ONGOING',
    completed: 'COMPLETED',
  };
  return statusMap[status] || 'REQUESTED';
};

// Map API booking status to list view status (for filtering)
const mapBookingStatusToList = (status: string): ListStatus => {
  const statusMap: Record<string, ListStatus> = {
    requested: 'UPCOMING',
    accepted: 'ONGOING',
    rejected: 'CANCELLED',
    rescheduledByCustomer: 'UPCOMING',
    rescheduledBySp: 'UPCOMING',
    cancelledByCustomer: 'CANCELLED',
    cancelledBySp: 'CANCELLED',
    ontheway: 'ONGOING',
    reached: 'ONGOING',
    ongoing: 'ONGOING',
    completed: 'COMPLETED',
  };
  return statusMap[status] || 'UPCOMING';
};

// Get display label for status
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    requested: 'Requested',
    accepted: 'Accepted',
    rejected: 'Rejected',
    rescheduledByCustomer: 'Rescheduled',
    rescheduledBySp: 'Rescheduled',
    cancelledByCustomer: 'Cancelled',
    cancelledBySp: 'Cancelled',
    onTheWay: 'On The Way',
    reached: 'Reached',
    ongoing: 'Ongoing',
    completed: 'Completed',
  };
  return statusMap[status] || status || 'Requested';
};

/** Booking status label for UI (uses i18n when `t` is provided). */
export function getTranslatedBookingStatus(
  status: string | undefined | null,
  t?: (key: string) => string,
): string {
  if (!status) return '';
  if (t) {
    const key = `bookingDetails.statusLabels.${status}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return getStatusLabel(status);
}

const getStatusColor = (status: any) => {
  switch (status) {
    case 'requested':
      return Colors.warningColor || '#FF9800';
    case 'accepted':
      return '#4CAF50';
    case 'rejected':
      return Colors.red || '#F44336';
    case 'rescheduledByCustomer':
      return Colors.primary_light || Colors.primary;
    case 'rescheduledBySp':
      return Colors.warningColor || '#FF9800';
    case 'cancelledByCustomer':
      return Colors.red || '#F44336';
    case 'cancelledBySp':
      return Colors.red || '#F44336';
    case 'ontheway':
      return '#FF9800';
    case 'reached':
      return '#2196F3';
    case 'ongoing':
      return '#009BFF';
    case 'completed':
      return '#4CAF50';
    default:
      return Colors.text;
  }
};
const formatAddress = ({
  line1 = '',
  line2 = '',
  landmark = '',
  pincode = '',
  city = '',
  country = '',
}: {
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  city: string;
  country: string;
}): string => {
  return [line1, line2, landmark, pincode, city, country]
    .filter(value => value && value.trim() !== '')
    .join(', ');
};

// Check if status is cancelled or rejected
const isCancelledOrRejected = (status: string): boolean => {
  const cancelledStatuses = [
    'rejected',
    'cancelledByCustomer',
    'cancelledBySp',
  ];
  return cancelledStatuses.includes(status);
};

const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const permission: Permission | undefined = Platform.select({
      ios: PERMISSIONS.IOS.CONTACTS,
      android: PERMISSIONS.ANDROID.READ_CONTACTS,
    });

    if (!permission) return false;

    // 🔹 Check current status
    const status = await check(permission);

    // ✅ Already granted
    if (status === RESULTS.GRANTED) {
      return true;
    }

    // 🔹 First time or denied
    if (status === RESULTS.DENIED) {
      const requestStatus = await request(permission);
      return requestStatus === RESULTS.GRANTED;
    }

    // 🔹 Blocked (Don't ask again selected)
    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Contacts Permission Required',
        'Contacts access is blocked. Please enable it from settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
      return false;
    }

    // 🔹 Unavailable (device restriction / simulator)
    if (status === RESULTS.UNAVAILABLE) {
      Alert.alert(
        'Contacts Unavailable',
        'Contacts are not available on this device.',
      );
      return false;
    }

    return false;
  } catch (error) {
    console.log('Contacts Permission Error:', error);
    return false;
  }
};

// Utility functions for time conversion between local and UTC

export const convertLocalTimeToUTC = (localTime: string): string => {
  if (!localTime) return '';

  // localTime is in "HH:mm" format
  const [hours, minutes] = localTime.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return localTime;

  // Create a date object for today with the local time
  const today = new Date();
  const localDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes,
  );

  // Get UTC time
  const utcHours = String(localDate.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(localDate.getUTCMinutes()).padStart(2, '0');

  return `${utcHours}:${utcMinutes}`;
};

export const convertUTCToLocalTime = (utcTime: string): string => {
  if (!utcTime) return '';

  // utcTime is in "HH:mm" format (UTC)
  const [hours, minutes] = utcTime.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return utcTime;

  // Create a date object for today with the UTC time
  const today = new Date();
  const utcDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      hours,
      minutes,
    ),
  );

  // Get local time
  const localHours = String(utcDate.getHours()).padStart(2, '0');
  const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');

  return `${localHours}:${localMinutes}`;
};

/** Service names from a booking list/detail payload (`bookedServices`). */
export function getBookingServiceNames(booking: any): string[] {
  const rows = booking?.bookedServices;
  if (!Array.isArray(rows)) return [];
  const names: string[] = [];
  for (const row of rows) {
    const sid = row?.serviceId;
    const name =
      typeof sid === 'object' && sid?.name
        ? String(sid.name).trim()
        : typeof row?.serviceName === 'string'
          ? row.serviceName.trim()
          : typeof row?.name === 'string'
            ? row.name.trim()
            : '';
    if (name) names.push(name);
  }
  return names;
}

/** Single service preference label (atHome, online, onPremises). */
export function formatPreferenceLabel(
  pref: string,
  t: (key: string) => string,
): string {
  const trimmed = String(pref).trim();
  if (!trimmed) return '';
  const key = `home.servicePreference.${trimmed}`;
  const translated = t(key);
  return translated === key ? trimmed : translated;
}

/** Translates booking `preferences` (atHome, online, onPremises) for display. */
export function formatBookingPreferencesForDisplay(
  preferences: unknown,
  t: (key: string) => string,
): string {
  if (!Array.isArray(preferences) || preferences.length === 0) return '';
  const unique = [
    ...new Set(preferences.map(p => String(p).trim()).filter(Boolean)),
  ];
  return unique.map(pref => formatPreferenceLabel(pref, t)).join(', ');
}

/** Booking detail date e.g. 23-May-2026 using localized month names. */
export function formatBookingDisplayDate(
  dateString: string,
  monthsLong: string[],
): string {
  if (!dateString || typeof dateString !== 'string') return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const months = Array.isArray(monthsLong) ? monthsLong : [];
  const monthName = months[date.getMonth()] ?? '';
  return `${date.getDate()}-${monthName}-${date.getFullYear()}`;
}

/** Formats API `distanceKm` for UI (e.g. "0.15 km away", "6.9 km away"). */
export function formatDistanceKmAway(
  km: number | undefined | null,
): string | null {
  if (km == null || typeof km !== 'number' || !Number.isFinite(km) || km < 0) {
    return null;
  }
  return km < 1 ? `${km.toFixed(2)} km away` : `${km.toFixed(1)} km away`;
}

export function formatProviderName(name: string): string {
  if (!name) return '';
  return name
    ? name?.trim().charAt(0).toUpperCase() + name?.trim()?.slice(1)
    : '';
}

export type ProviderNameSource =
  | string
  | null
  | undefined
  | {
      name?: string | null;
      businessProfile?: { name?: string | null } | null;
      spBusinessProfile?: { name?: string | null } | null;
    };

/** Prefer `businessProfile.name`, then account `name`, for customer-facing provider labels. */
export function getProviderDisplayName(
  source: ProviderNameSource,
  fallback = '',
): string {
  if (source == null) return fallback;
  if (typeof source === 'string') {
    const trimmed = source.trim();
    return trimmed ? formatProviderName(trimmed) : fallback;
  }

  const businessName =
    source.businessProfile?.name?.trim() ||
    source.spBusinessProfile?.name?.trim() ||
    '';
  const personalName = source.name?.trim() || '';
  const chosen = businessName || personalName;
  return chosen ? formatProviderName(chosen) : fallback;
}

export {
  formatDate,
  formatBookingAddress,
  mapBookingStatusToDisplay,
  mapBookingStatusToList,
  getStatusLabel,
  getTranslatedBookingStatus,
  isCancelledOrRejected,
  getStatusColor,
  formatAddress,
  requestContactsPermission,
};
