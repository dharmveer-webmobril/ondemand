import { GOOGLE_MAPS_API_KEY } from '../../config/googleMaps';
import { GOOGLE_PLACES_DETAILS_FIELDS } from './constants';

export function createGooglePlacesQuery(countryIsoUpper: string) {
  return {
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
    components: `country:${countryIsoUpper}`,
  } as const;
}

export function createGooglePlacesDetailsQuery() {
  return { fields: GOOGLE_PLACES_DETAILS_FIELDS };
}
