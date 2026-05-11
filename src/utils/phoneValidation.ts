import {
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

/**
 * Validates a national-significant number (digits only, no country dial prefix)
 * for the given ISO 3166-1 alpha-2 region (e.g. `in` / `IN` → India).
 */
export function isValidNationalPhoneNumber(
  nationalDigits: string,
  countryIso2: string,
): boolean {
  const digits = (nationalDigits || '').replace(/\D/g, '');
  if (!digits) return false;

  const iso = (countryIso2 || '').trim().toUpperCase();
  if (iso.length !== 2) return false;

  try {
    const phone = parsePhoneNumberFromString(digits, iso as CountryCode);
    return phone?.isValid() === true;
  } catch {
    return false;
  }
}

/** Returns E.164 (e.g. `+919876543210`) or `null` if invalid for the region. */
export function formatNationalToE164(
  nationalDigits: string,
  countryIso2: string,
): string | null {
  const digits = (nationalDigits || '').replace(/\D/g, '');
  if (!digits) return null;
  const iso = (countryIso2 || '').trim().toUpperCase();
  if (iso.length !== 2) return null;
  try {
    const phone = parsePhoneNumberFromString(digits, iso as CountryCode);
    if (!phone?.isValid()) return null;
    return phone.format('E.164');
  } catch {
    return null;
  }
}
