/**
 * Normalized customer delivery / service location (matches AddAddress saved shape).
 * Used in Redux and when mapping GET `/auth/customer/addresses` rows.
 */

export type CustomerLocationAddress = {
  _id?: string;
  name?: string;
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  countryName: string;
  cityName: string;
  countryIso2: string;
  lat: string;
  lng: string;
  googlePlaceId: string;
  formattedAddress: string;
};

export function emptyCustomerLocationAddress(): CustomerLocationAddress {
  return {
    line1: '',
    line2: '',
    landmark: '',
    pincode: '',
    countryName: '',
    cityName: '',
    countryIso2: '',
    lat: '',
    lng: '',
    googlePlaceId: '',
    formattedAddress: '',
  };
}

/** Map API address document (list/edit) to normalized location for Redux & forms. */
export function mapApiAddressToCustomerLocation(
  item: unknown,
): CustomerLocationAddress | null {
  if (!item || typeof item !== 'object') return null;
  const a = item as Record<string, unknown>;
  const coords = a.coordinates as { lat?: number; lng?: number } | undefined;
  const city = a.city as { name?: string; countryIso2?: string } | undefined;
  const country = a.country as { name?: string } | undefined;

  const cityName = String(a.cityName ?? city?.name ?? '').trim();
  const countryName = String(a.countryName ?? country?.name ?? '').trim();
  let iso = String(a.countryIso2 ?? city?.countryIso2 ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 2);

  const gid = a.googlePlaceId;
  const googlePlaceId =
    gid != null && gid !== '' ? String(gid) : '';

  return {
    _id: a._id != null ? String(a._id) : undefined,
    name: a.name != null ? String(a.name) : undefined,
    line1: String(a.line1 ?? ''),
    line2: String(a.line2 ?? ''),
    landmark: String(a.landmark ?? ''),
    pincode: String(a.pincode ?? ''),
    countryName,
    cityName,
    countryIso2: iso,
    lat: coords?.lat != null ? String(coords.lat) : '',
    lng: coords?.lng != null ? String(coords.lng) : '',
    googlePlaceId,
    formattedAddress: String(a.formattedAddress ?? a.line1 ?? ''),
  };
}

type GeocodeAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

/**
 * Map a single Google Geocoding / reverse-geocode result to `CustomerLocationAddress`.
 * Used for GPS → reverse geocode; same field rules as AddAddress geocode path.
 */
export function geocodeResultToCustomerLocation(
  result: {
    address_components?: GeocodeAddressComponent[];
    formatted_address?: string;
    place_id?: string;
  },
  lat: number,
  lng: number,
): CustomerLocationAddress {
  const components = result?.address_components ?? [];
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
    if (types.includes('administrative_area_level_2') && !city) {
      city = c.long_name;
    }
    if (types.includes('postal_code')) postal = c.long_name;
    if (types.includes('country')) {
      country = c.long_name;
      countryIso2 = (c.short_name || '').toLowerCase();
    }
  }

  const streetLine = [streetNumber, route].filter(Boolean).join(' ').trim();
  const formatted = result.formatted_address?.trim() || '';
  const line1 =
    streetLine ||
    formatted.split(',')[0]?.trim() ||
    formatted ||
    `${lat}, ${lng}`;

  const gid = result.place_id;
  const googlePlaceId =
    gid != null && gid !== '' ? String(gid) : '';

  return {
    line1,
    line2: '',
    landmark: '',
    pincode: postal,
    countryName: country,
    cityName: city,
    countryIso2,
    lat: String(lat),
    lng: String(lng),
    googlePlaceId,
    formattedAddress: formatted || line1,
  };
}
