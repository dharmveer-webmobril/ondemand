import countryToCurrency from 'country-to-currency';
import type { RootState } from '@store/index';
import { DEFAULT_COUNTRY_ISO2, DEFAULT_CURRENCY } from '../constants/currencies';

/** BCP 47 locales for correct decimal/grouping separators per country. */
const LOCALE_BY_COUNTRY: Record<string, string> = {
  IN: 'en-IN',
  ID: 'id-ID',
  US: 'en-US',
  SG: 'en-SG',
  JP: 'ja-JP',
  TH: 'th-TH',
  AU: 'en-AU',
  CA: 'en-CA',
  GB: 'en-GB',
  DE: 'de-DE',
  FR: 'fr-FR',
  ES: 'es-ES',
  IT: 'it-IT',
  PT: 'pt-PT',
  BR: 'pt-BR',
  MX: 'es-MX',
  AE: 'ar-AE',
  SA: 'ar-SA',
  NL: 'nl-NL',
  PL: 'pl-PL',
  TR: 'tr-TR',
  VN: 'vi-VN',
  KR: 'ko-KR',
  CN: 'zh-CN',
};

export function normalizeCountryIso2(value?: string | null): string {
  if (!value) return DEFAULT_COUNTRY_ISO2;
  const iso = String(value).replace(/[^a-zA-Z]/g, '').toUpperCase();
  return iso.length === 2 ? iso : DEFAULT_COUNTRY_ISO2;
}

export function getCountryIso2FromUserDetails(
  userDetails: Record<string, unknown> | null | undefined,
): string {
  if (!userDetails) return DEFAULT_COUNTRY_ISO2;

  if (userDetails.countryIso2) {
    return normalizeCountryIso2(String(userDetails.countryIso2));
  }

  const country = userDetails.country;
  if (country && typeof country === 'object') {
    const c = country as Record<string, unknown>;
    if (c.countryCode) return normalizeCountryIso2(String(c.countryCode));
    if (c.code) return normalizeCountryIso2(String(c.code));
  }

  return DEFAULT_COUNTRY_ISO2;
}

export function getProfileCountryIso2(state: RootState): string {
  const fromUser = getCountryIso2FromUserDetails(
    state.auth.userDetails as Record<string, unknown> | null,
  );
  if (fromUser !== DEFAULT_COUNTRY_ISO2) {
    return fromUser;
  }

  const locationIso = state.app.currentLocationAddress?.countryIso2;
  if (locationIso) {
    return normalizeCountryIso2(locationIso);
  }

  return DEFAULT_COUNTRY_ISO2;
}

export function getCurrencyForCountryIso2(countryIso2: string): string {
  const iso = normalizeCountryIso2(countryIso2);
  const map = countryToCurrency as Record<string, string>;
  return map[iso] || DEFAULT_CURRENCY;
}

export function getLocaleForCountryIso2(
  countryIso2: string,
  appLanguage?: string,
): string {
  const iso = normalizeCountryIso2(countryIso2);
  if (LOCALE_BY_COUNTRY[iso]) {
    return LOCALE_BY_COUNTRY[iso];
  }

  const langMap: Record<string, string> = {
    en: 'en',
    sp: 'es',
    frcd: 'fr',
    pt: 'pt',
    hn: 'hi',
  };
  const lang = langMap[appLanguage || 'en'] || 'en';
  return `${lang}-${iso}`;
}
