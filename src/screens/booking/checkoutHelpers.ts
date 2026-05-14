export type PaymentModeKey = 'cash' | 'online' | 'wallet' | 'wallet_partial';
export type BookingPaymentMethod = 'paypal' | 'stripe' | 'cash' | 'wallet';

type LocationValue = { name?: string } | string;

export type Address = {
  _id: string;
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city?: LocationValue;
  country?: LocationValue;
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

export const shouldUseGatewayPayment = (
  selectedPaymentMethod: BookingPaymentMethod,
) => {
  return (
    selectedPaymentMethod === 'stripe' || selectedPaymentMethod === 'paypal'
  );
};

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
