import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setLanguage } from '@store/slices/appSlice';
import {
  formatCurrencyAmount,
  formatDisplayAmount,
  getDisplayCurrency,
  setDisplayCurrencySync,
  setFormattingLocaleSync,
} from '@utils/currency';
import { useTranslation } from 'react-i18next';
import {
  getCurrencyForCountryIso2,
  getLocaleForCountryIso2,
  getProfileCountryIso2,
} from '@utils/profileLocale';

type CurrencyContextValue = {
  displayCurrency: string;
  countryIso2: string;
  formatAmount: (value: unknown, currencyCode?: string) => string;
  formatInCurrency: (value: unknown, currencyCode: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function CurrencyProviderInner({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const countryIso2 = useAppSelector(getProfileCountryIso2);
  const { i18n } = useTranslation();

  const displayCurrency = useMemo(
    () => getCurrencyForCountryIso2(countryIso2),
    [countryIso2],
  );

  const countryLocale = useMemo(
    () => getLocaleForCountryIso2(countryIso2, i18n.language),
    [countryIso2, i18n.language],
  );

  useEffect(() => {
    setDisplayCurrencySync(displayCurrency);
    setFormattingLocaleSync(countryLocale);
  }, [displayCurrency, countryLocale]);

  useEffect(() => {
    dispatch(setLanguage(i18n.language));
  }, [dispatch, i18n.language]);

  const formatAmount = useCallback(
    (value: unknown, currencyCode?: string) =>
      currencyCode
        ? formatCurrencyAmount(Number(value) || 0, currencyCode, countryLocale)
        : formatDisplayAmount(value),
    [displayCurrency, countryLocale],
  );

  const formatInCurrency = useCallback(
    (value: unknown, currencyCode: string) =>
      formatCurrencyAmount(Number(value) || 0, currencyCode, countryLocale),
    [countryLocale],
  );

  const value = useMemo(
    () => ({
      displayCurrency: displayCurrency || getDisplayCurrency(),
      countryIso2,
      formatAmount,
      formatInCurrency,
    }),
    [displayCurrency, countryIso2, formatAmount, formatInCurrency],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  return <CurrencyProviderInner>{children}</CurrencyProviderInner>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
