import i18next from 'i18next';
import { store } from '@store/index';
import { DEFAULT_COUNTRY_ISO2, DEFAULT_CURRENCY } from '../constants/currencies';
import { mapI18nLanguageToAcceptLanguage } from './langauage/locale';
import {
  getCurrencyForCountryIso2,
  getProfileCountryIso2,
} from './profileLocale';

export type ApiLocaleHeaders = {
  'X-Currency': string;
  'X-Country-Iso2': string;
  'Accept-Language': string;
};

/** Headers sent on every API request for locale-aware pricing/content. */
export function getApiLocaleHeaders(): ApiLocaleHeaders {
  const state = store.getState();
  const countryIso2 = getProfileCountryIso2(state) || DEFAULT_COUNTRY_ISO2;
  const currency = getCurrencyForCountryIso2(countryIso2) || DEFAULT_CURRENCY;
  const acceptLanguage = mapI18nLanguageToAcceptLanguage(
    state.app.language || i18next.language || 'en',
  );

  return {
    'X-Currency': currency,
    'X-Country-Iso2': countryIso2,
    'Accept-Language': acceptLanguage,
  };
}
