import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

export type ParsedContactPhone = {
  dialCode: string;
  countryIso2: string;
  nationalNumber: string;
};

const normalizeDialCode = (dial: string): string => {
  const trimmed = (dial || '').replace(/\s/g, '');
  if (!trimmed) return '';
  return trimmed.startsWith('+')
    ? trimmed
    : `+${trimmed.replace(/^\++/, '')}`;
};

export function defaultPhoneForCountry(iso2: string): ParsedContactPhone {
  const iso = (iso2 || 'in').trim().toUpperCase();
  try {
    const callingCode = getCountryCallingCode(iso as CountryCode);
    return {
      dialCode: `+${callingCode}`,
      countryIso2: iso.toLowerCase(),
      nationalNumber: '',
    };
  } catch {
    return { dialCode: '+91', countryIso2: 'in', nationalNumber: '' };
  }
}

/**
 * Parses a raw contact phone string into dial code, country ISO2, and national digits.
 * Strips formatting (spaces, brackets, dashes) from the national number.
 */
export function parseContactPhoneNumber(
  raw: string,
  defaultCountryIso2 = 'in',
): ParsedContactPhone {
  const fallback = defaultPhoneForCountry(defaultCountryIso2);
  const trimmed = (raw || '').trim();
  if (!trimmed) return { ...fallback };

  const digitsOnly = trimmed.replace(/\D/g, '');
  const candidates: string[] = [];

  if (trimmed.startsWith('+')) {
    candidates.push(trimmed.replace(/[^\d+]/g, ''));
  }
  candidates.push(trimmed);
  if (digitsOnly) {
    candidates.push(digitsOnly);
    if (!trimmed.startsWith('+') && digitsOnly.length >= 11) {
      candidates.push(`+${digitsOnly}`);
    }
  }

  const defaultIso = fallback.countryIso2.toUpperCase() as CountryCode;

  for (const candidate of [...new Set(candidates.filter(Boolean))]) {
    let parsed =
      parsePhoneNumberFromString(candidate) ||
      parsePhoneNumberFromString(candidate, defaultIso);

    if (!parsed && digitsOnly.startsWith('0') && candidate === digitsOnly) {
      parsed = parsePhoneNumberFromString(
        digitsOnly.replace(/^0+/, ''),
        defaultIso,
      );
    }

    if (parsed?.nationalNumber) {
      const iso = (parsed.country || defaultIso).toLowerCase();
      return {
        dialCode: normalizeDialCode(`+${parsed.countryCallingCode}`),
        countryIso2: iso,
        nationalNumber: parsed.nationalNumber,
      };
    }
  }

  let national = digitsOnly;
  if (national.startsWith('0')) {
    national = national.replace(/^0+/, '');
  }

  return {
    ...fallback,
    nationalNumber: national,
  };
}

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
