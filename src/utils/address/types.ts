export type GooglePlaceDetailsInput = {
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: number | (() => number);
      lng?: number | (() => number);
    };
  };
  place_id?: string;
};

export type SignupAddressSelection = {
  name?: string;
  formattedAddress: string;
  googlePlaceId?: string;
  coordinates: { lat: number; lng: number };
  cityName: string;
  countryName: string;
  countryIso2: string;
  pincode: string;
};
