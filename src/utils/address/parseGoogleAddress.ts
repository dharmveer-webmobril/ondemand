import type { GooglePlaceDetailsInput } from './types';

export type ParsedAddressFields = {
  line1: string;
  cityName: string;
  pincode: string;
  countryName: string;
  countryIso2: string;
  lat: string;
  lng: string;
  googlePlaceId: string;
  formattedAddress: string;
};

export function parseGoogleAddressComponents(
  details: GooglePlaceDetailsInput,
): ParsedAddressFields {
  const components = details?.address_components ?? [];
  let route = '';
  let streetNumber = '';
  let city = '';
  let postal = '';
  let country = '';
  let countryIso2 = '';

  for (const c of components) {
    const types = c.types;
    if (types.includes('street_number')) streetNumber = c.long_name;
    if (types.includes('route')) route = c.long_name;
    if (types.includes('locality')) city = c.long_name;
    if (types.includes('postal_town') && !city) city = c.long_name;
    if (types.includes('sublocality_level_1') && !city) city = c.long_name;
    if (types.includes('administrative_area_level_2') && !city)
      city = c.long_name;
    if (types.includes('postal_code')) postal = c.long_name;
    if (types.includes('country')) {
      country = c.long_name;
      countryIso2 = (c.short_name || '').toLowerCase();
    }
  }

  const streetLine = [streetNumber, route].filter(Boolean).join(' ').trim();
  const line1 =
    streetLine ||
    details.formatted_address?.split(',')[0]?.trim() ||
    details.formatted_address ||
    '';

  const loc = details.geometry?.location as
    | { lat?: number | (() => number); lng?: number | (() => number) }
    | undefined;
  let lat: number | undefined;
  let lng: number | undefined;
  if (loc) {
    lat = typeof loc.lat === 'function' ? (loc.lat as () => number)() : loc.lat;
    lng = typeof loc.lng === 'function' ? (loc.lng as () => number)() : loc.lng;
  }

  return {
    line1,
    cityName: city,
    pincode: postal,
    countryName: country,
    countryIso2,
    lat: lat != null ? String(lat) : '',
    lng: lng != null ? String(lng) : '',
    googlePlaceId: details.place_id ?? '',
    formattedAddress: details.formatted_address ?? line1,
  };
}
