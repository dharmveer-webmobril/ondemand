import { Platform } from 'react-native';

export type PaymentModeKey = 'cash' | 'online' | 'wallet' | 'wallet_partial';
export type BookingPaymentMethod = 'paypal' | 'stripe' | 'flutterwave' | 'cash' | 'wallet';

type LocationValue = { name?: string } | string;

export type Address = {
  _id: string;
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city?: LocationValue;
  country?: LocationValue;
  countryIso2?: string;
  pincode: string;
  contact: string;
  addressType: 'home' | 'office' | 'other';
  isDefault?: boolean;
};

export type OtherPersonDetails = {
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  address?: Address | null;
  [key: string]: any;
} | null;

export type AtHomeCountryRestriction = {
  name?: string;
  iso2?: string;
  phoneCode?: string;
} | null;

const normalizeText = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase();

const normalizeIso2 = (value: unknown): string => {
  const raw = normalizeText(value).replace(/[^a-z]/g, '');
  return raw.length === 2 ? raw : '';
};

const normalizePhoneCode = (value: unknown): string => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? `+${digits}` : '';
};

const getLocationName = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;
    return String(item.name ?? item.countryName ?? '').trim();
  }
  return '';
};

const getLocationIso2 = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '';
  const item = value as Record<string, unknown>;
  return (
    normalizeIso2(item.countryIso2) ||
    normalizeIso2(item.iso2) ||
    normalizeIso2(item.code) ||
    normalizeIso2(item.countryCode)
  );
};

export function getAddressCountryName(address: Address | null | undefined): string {
  return getLocationName(address?.country);
}

export function getAddressCountryIso2(address: Address | null | undefined): string {
  return (
    normalizeIso2(address?.countryIso2) ||
    getLocationIso2(address?.country)
  );
}

export function getAtHomeCountryRestriction(
  bookingData: any,
): AtHomeCountryRestriction {
  const provider = bookingData?.providerData ?? {};
  const country =
    provider?.businessProfile?.country ??
    provider?.spBusinessProfile?.country ??
    provider?.country ??
    bookingData?.country;

  const name = getLocationName(country);
  const iso2 =
    getLocationIso2(country) ||
    normalizeIso2(provider?.countryIso2) ||
    normalizeIso2(bookingData?.countryIso2);
  const phoneCode =
    normalizePhoneCode((country as any)?.phoneCode) ||
    normalizePhoneCode((country as any)?.dialCode) ||
    normalizePhoneCode(provider?.phoneCode) ||
    normalizePhoneCode(bookingData?.phoneCode);

  if (!name && !iso2 && !phoneCode) return null;
  return { name, iso2, phoneCode };
}

export function addressMatchesAtHomeCountry(
  address: Address | null | undefined,
  restriction: AtHomeCountryRestriction,
): boolean {
  if (!restriction || !address) return true;

  const targetIso = normalizeIso2(restriction.iso2);
  const addressIso = getAddressCountryIso2(address);
  if (targetIso && addressIso) return targetIso === addressIso;

  const targetName = normalizeText(restriction.name);
  const addressName = normalizeText(getAddressCountryName(address));
  if (targetName && addressName) return targetName === addressName;

  return true;
}

export function phoneCountryMatchesAtHomeCountry(
  countryIso2: string | undefined,
  dialCode: string | undefined,
  restriction: AtHomeCountryRestriction,
): boolean {
  if (!restriction) return true;

  const targetIso = normalizeIso2(restriction.iso2);
  const nextIso = normalizeIso2(countryIso2);
  if (targetIso && nextIso) return targetIso === nextIso;

  const targetDial = normalizePhoneCode(restriction.phoneCode);
  const nextDial = normalizePhoneCode(dialCode);
  if (targetDial && nextDial) return targetDial === nextDial;

  return true;
}

type ValidateCheckoutFormParams = {
  deliveryMode?: string;
  needsAddress: boolean;
  serviceFor: 'self' | 'other';
  selectedAddress: Address | null;
  otherPersonDetails: OtherPersonDetails;
  otherPersonAddressRequired: boolean;
};

type BuildBookingPayloadParams = {
  bookingData: any;
  selectedServices: any[];
  serviceFor: 'self' | 'other';
  selectedAddress: Address | null;
  otherPersonDetails: OtherPersonDetails;
  paymentMode: PaymentModeKey;
  walletAmountUsed: number;
  bookingId?: string | null;
};

export const getWalletPartialAmount = (
  walletBalance: number,
  totalPrice: number,
  walletPartialAmount: string,
) => {
  return Math.min(
    walletBalance,
    totalPrice,
    Math.max(0, parseFloat(walletPartialAmount) || 0),
  );
};

export const getRemainingAfterWallet = (
  totalPrice: number,
  walletPartialNum: number,
) => {
  return Math.max(0, totalPrice - walletPartialNum);
};

export const isWalletFullyCovered = (
  totalPrice: number,
  walletBalance: number,
  paymentMode: PaymentModeKey,
) => {
  return totalPrice <= walletBalance && paymentMode === 'wallet';
};

export const hasInsufficientWalletBalance = (
  paymentMode: PaymentModeKey,
  totalPrice: number,
  walletBalance: number,
  walletPartialAmount: string,
) => {
  return (
    (paymentMode === 'wallet' && totalPrice > walletBalance) ||
    (paymentMode === 'wallet_partial' && walletBalance <= 0) ||
    (paymentMode === 'wallet_partial' &&
      (parseFloat(walletPartialAmount) || 0) > walletBalance)
  );
};

export const hasInvalidPartialWalletAmount = (
  paymentMode: PaymentModeKey,
  totalPrice: number,
  walletPartialAmount: string,
) => {
  if (paymentMode !== 'wallet_partial') {
    return false;
  }

  const enteredAmount = parseFloat(walletPartialAmount) || 0;
  return enteredAmount >= totalPrice;
};

export const isCheckoutFormValid = ({
  deliveryMode,
  needsAddress,
  serviceFor,
  selectedAddress,
  otherPersonDetails,
  otherPersonAddressRequired,
}: ValidateCheckoutFormParams) => {
  if (
    (deliveryMode === 'onPremises' || deliveryMode === 'online') &&
    serviceFor === 'self'
  ) {
    return true;
  }

  if (needsAddress && serviceFor === 'self') {
    return !!selectedAddress;
  }

  if (serviceFor === 'other') {
    if (
      !otherPersonDetails?.name ||
      !otherPersonDetails?.email ||
      !otherPersonDetails?.phone
    ) {
      return false;
    }

    if (otherPersonAddressRequired && !otherPersonDetails?.address) {
      return false;
    }

    return true;
  }

  return true;
};

export const buildSelectedServicesPayload = (selectedServices: any[] = []) => {
  return (Array.isArray(selectedServices) ? selectedServices : [])
    .filter((service: any) => service != null)
    .map((service: any) => ({
      serviceId: service?._id,
      addOnIds:
        (service?.selectedAddOns || [])
          .filter((addOn: any) => addOn != null)
          .map((addOn: any) => addOn?._id)
          .filter(Boolean) || [],
      promotionOfferId: service?.selectedOfferId || null,
    }));
};

export function isRoutineCheckout(bookingData: any): boolean {
  return bookingData?.bookingType === 'routine';
}

/** Routine booking Mongo id from create-routine response. */
export function getRoutineBookingIdFromCreateResponse(response: any): string | null {
  const data = response?.ResponseData;
  if (!data) {
    return null;
  }
  const raw = data.routineBooking;
  if (raw && typeof raw === 'object') {
    const id = raw._id ?? raw.id;
    if (id != null && String(id).trim() !== '') {
      return String(id).trim();
    }
  }
  if (data.routineBookingId != null && String(data.routineBookingId).trim() !== '') {
    return String(data.routineBookingId).trim();
  }
  return null;
}

/** Payable amount from create-routine (falls back to client total). */
export function getRoutineAmountFromCreateResponse(
  response: any,
  fallbackTotal: number,
): number {
  const amount = response?.ResponseData?.amount;
  if (amount != null && Number.isFinite(Number(amount))) {
    return Number(amount);
  }
  const cents = response?.ResponseData?.routineBooking?.pricing?.totalCents;
  if (cents != null && Number.isFinite(Number(cents))) {
    return Number(cents) / 100;
  }
  return fallbackTotal;
}

/** Booking id from create-booking (shape varies: string id, object, or bookingId). */
export function getBookingIdFromCreateResponse(response: any): string | null {
  const data = response?.ResponseData;
  if (!data) {
    return null;
  }
  const raw = data.booking;
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim();
  }
  if (raw && typeof raw === 'object') {
    const id = raw._id ?? raw.id;
    if (id != null && String(id).trim() !== '') {
      return String(id).trim();
    }
  }
  if (data.bookingId != null && String(data.bookingId).trim() !== '') {
    return String(data.bookingId).trim();
  }
  return null;
}

export const buildRoutineBookingPayload = ({
  bookingData,
  selectedServices,
  serviceFor,
  selectedAddress,
  otherPersonDetails,
  paymentMode,
}: Omit<BuildBookingPayloadParams, 'walletAmountUsed' | 'bookingId'>) => {
  const remark =
    typeof bookingData?.remark === 'string' && bookingData.remark.trim() !== ''
      ? bookingData.remark.trim()
      : undefined;

  const sessions = (Array.isArray(bookingData?.sessions) ? bookingData.sessions : [])
    .map((session: { date?: string; time?: string; timeSlot?: string }) => ({
      date: session?.date ?? '',
      time: session?.time ?? session?.timeSlot ?? '',
    }))
    .filter((session: { date: string; time: string }) => session.date && session.time);

  const preferences = bookingData?.deliveryMode ? [bookingData.deliveryMode] : [];

  const other =
    serviceFor === 'other' && otherPersonDetails
      ? {
          name: otherPersonDetails?.name ?? '',
          email: otherPersonDetails?.email ?? '',
          contact: [otherPersonDetails?.countryCode, otherPersonDetails?.phone]
            .filter(Boolean)
            .join(' '),
          countryCode: otherPersonDetails?.countryCode ?? '',
        }
      : null;

  return {
    spId: bookingData?.providerData?._id ?? bookingData?.providerId,
    services: buildSelectedServicesPayload(selectedServices),
    sessions,
    paymentType: paymentMode,
    preferences,
    bookedFor: serviceFor,
    ...(paymentMode === 'online' ? { isTemp: true } : {}),
    ...(selectedAddress?._id ? { addressId: selectedAddress._id } : {}),
    ...(remark != null ? { remark } : {}),
    ...(serviceFor === 'other' ? { other, otherDetails: other } : {}),
  };
};

export const buildBookingPayload = ({
  bookingData,
  selectedServices,
  serviceFor,
  selectedAddress,
  otherPersonDetails,
  paymentMode,
  walletAmountUsed,
  bookingId,
}: BuildBookingPayloadParams) => {
  const remark =
    typeof bookingData?.remark === 'string' && bookingData.remark.trim() !== ''
      ? bookingData.remark.trim()
      : undefined;

  // Create-booking API: wallet / wallet_partial match server shape (wallet split happens on initiate).
  const includeWalletOnCreate =  paymentMode === 'wallet' && walletAmountUsed > 0 ? walletAmountUsed : undefined;

  return {
    ...(bookingId ? { _id: bookingId } : {}),
    spId: bookingData?.providerData?._id,
    services: buildSelectedServicesPayload(selectedServices),
    bookedFor: serviceFor,
    addressId: selectedAddress?._id,
    otherDetails: otherPersonDetails
      ? {
          name: otherPersonDetails?.name ?? '',
          email: otherPersonDetails?.email ?? '',
          contact: [otherPersonDetails?.countryCode, otherPersonDetails?.phone]
            .filter(Boolean)
            .join(' '),
          countryCode: otherPersonDetails?.countryCode ?? '',
        }
      : null,
    date: bookingData?.date,
    time: bookingData?.timeSlot,
    paymentType: paymentMode,
    ...(remark != null ? { remark } : {}),
    ...(includeWalletOnCreate != null
      ? { walletAmountUsed: includeWalletOnCreate }
      : {}),
    preferences: [bookingData?.deliveryMode],
  };
};

export const buildWalletCheckoutPayload = ({
  bookingData,
  selectedServices,
  serviceFor,
  selectedAddress,
  otherPersonDetails,
}: Omit<BuildBookingPayloadParams, 'paymentMode' | 'walletAmountUsed' | 'bookingId'>) => {
  const remark =
    typeof bookingData?.remark === 'string' && bookingData.remark.trim() !== ''
      ? bookingData.remark.trim()
      : undefined;

  return {
    spId: bookingData?.providerData?._id,
    services: buildSelectedServicesPayload(selectedServices),
    bookedFor: serviceFor,
    addressId: selectedAddress?._id,
    otherDetails: otherPersonDetails
      ? {
          name: otherPersonDetails?.name ?? '',
          email: otherPersonDetails?.email ?? '',
          contact: [otherPersonDetails?.countryCode, otherPersonDetails?.phone]
            .filter(Boolean)
            .join(' '),
          countryCode: otherPersonDetails?.countryCode ?? '',
        }
      : null,
    date: bookingData?.date,
    time: bookingData?.timeSlot,
    paymentType: 'wallet',
    ...(remark != null ? { remark } : {}),
    preferences: [bookingData?.deliveryMode],
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  };
};

export const shouldUseGatewayPayment = (
  selectedPaymentMethod: BookingPaymentMethod,
) => {
  return (
    selectedPaymentMethod === 'stripe' ||
    selectedPaymentMethod === 'paypal' ||
    selectedPaymentMethod === 'flutterwave'
  );
};

/** Wallet partial with online card for remainder — temp booking before gateway payment. */
export const shouldCreateTempBooking = (
  paymentMode: PaymentModeKey,
  remainingAfterWallet: number,
): boolean =>
  paymentMode === 'wallet_partial' && remainingAfterWallet > 0;

/** Initiate-payment `amount`: full booking total; backend applies `wallet_partial` split. */
export const getGatewayChargeAmount = (
  selectedPaymentMethod: BookingPaymentMethod,
  _paymentMode: PaymentModeKey,
  _remainingAfterWallet: number,
  totalPrice: number,
) => {
  if (!shouldUseGatewayPayment(selectedPaymentMethod)) {
    return 0;
  }

  return totalPrice;
};
