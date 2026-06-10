import type { CustomerLocationAddress } from '@utils/address/customerLocation';
import type { SignupAddressSelection } from '@utils/address/types';

export type GuestLoginPayload = {
  formattedAddress: string;
  googlePlaceId: string;
  coordinates: { lat: number; lng: number };
  cityName: string;
  countryName: string;
  countryIso2: string;
};

export const GUEST_BLOCKED_PROFILE_MENU_IDS = new Set([
  '2',
  '3',
  'bookmarks',
  'transactions',
  'wallet',
  '6',
  '8',
]);

export const GUEST_BLOCKED_TAB_ROUTES = new Set(['BookingList', 'InboxScreen']);

export function isGuestUser(
  userDetails: { isGuest?: boolean } | null | undefined,
  isGuestFlag?: boolean,
): boolean {
  return !!isGuestFlag || userDetails?.isGuest === true;
}

export function mapSignupAddressToCustomerLocation(
  address: SignupAddressSelection,
): CustomerLocationAddress {
  return {
    line1: address.formattedAddress,
    line2: '',
    landmark: '',
    pincode: address.pincode || '',
    countryName: address.countryName,
    cityName: address.cityName,
    countryIso2: address.countryIso2,
    lat: String(address.coordinates.lat),
    lng: String(address.coordinates.lng),
    googlePlaceId: address.googlePlaceId || '',
    formattedAddress: address.formattedAddress,
  };
}

export function buildGuestLoginPayloadFromSignupAddress(
  address: SignupAddressSelection,
): GuestLoginPayload | null {
  const cityName = address.cityName?.trim();
  const countryName = address.countryName?.trim();
  const formattedAddress = address.formattedAddress?.trim();
  const lat = Number(address.coordinates?.lat);
  const lng = Number(address.coordinates?.lng);

  if (
    !formattedAddress ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !cityName ||
    !countryName
  ) {
    return null;
  }

  return {
    formattedAddress,
    googlePlaceId: address.googlePlaceId?.trim() || '',
    coordinates: { lat, lng },
    cityName,
    countryName,
    countryIso2: (address.countryIso2 || '').trim().toLowerCase().slice(0, 2),
  };
}

export function buildGuestLoginPayload(
  location: CustomerLocationAddress,
): GuestLoginPayload | null {
  const lat = Number.parseFloat(location.lat);
  const lng = Number.parseFloat(location.lng);
  const cityName = location.cityName?.trim();
  const countryName = location.countryName?.trim();
  const formattedAddress =
    location.formattedAddress?.trim() || location.line1?.trim();

  if (
    !formattedAddress ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !cityName ||
    !countryName
  ) {
    return null;
  }

  return {
    formattedAddress,
    googlePlaceId: location.googlePlaceId?.trim() || '',
    coordinates: { lat, lng },
    cityName,
    countryName,
    countryIso2: (location.countryIso2 || '').trim().toLowerCase().slice(0, 2),
  };
}
