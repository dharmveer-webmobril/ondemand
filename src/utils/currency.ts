import { DEFAULT_CURRENCY } from '../constants/currencies';

let displayCurrency = DEFAULT_CURRENCY;
let formattingLocale = 'en-US';

export function setFormattingLocaleSync(locale: string): void {
  if (locale) {
    formattingLocale = locale;
  }
}

export function getFormattingLocale(): string {
  return formattingLocale;
}

export function getDisplayCurrency(): string {
  return displayCurrency;
}

export function setDisplayCurrencySync(code: string): void {
  if (code) {
    displayCurrency = code.toUpperCase();
  }
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Format amount using country locale (comma vs dot separators) and currency symbol. */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  locale?: string,
): string {
  const code = (currencyCode || DEFAULT_CURRENCY).toUpperCase();
  const loc = locale || formattingLocale;

  try {
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: code,
    }).format(amount);
  } catch {
    return `${code} ${amount}`;
  }
}

/** Format value in the user's profile country currency (no conversion). */
export function formatDisplayAmount(value: unknown): string {
  const amount = parseAmount(value);
  return formatCurrencyAmount(amount, displayCurrency, formattingLocale);
}
