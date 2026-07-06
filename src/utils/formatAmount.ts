import {
  formatCurrencyAmount,
  formatDisplayAmount,
  getFormattingLocale,
} from './currency';

export const formatAmount = (
  value: unknown,
  currencyCode?: string,
): string => {
  if (currencyCode) {
    return formatCurrencyAmount(
      Number(value) || 0,
      currencyCode,
      getFormattingLocale(),
    );
  }
  return formatDisplayAmount(value);
};
