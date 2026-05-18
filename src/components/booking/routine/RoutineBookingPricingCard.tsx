import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { centsToDisplay } from '@utils/routineBookingHelpers';
import RoutineDetailKeyValueRow from './RoutineDetailKeyValueRow';

export type RoutineBookingPricing = {
  sessionCount?: number;
  subtotalCents?: number;
  discountAmountCents?: number;
  discountTierLabel?: string;
  discountPct?: number;
  totalCents?: number;
  currency?: string;
};

type RoutineBookingPricingCardProps = {
  pricing?: RoutineBookingPricing | null;
  sessionCountFallback?: number;
  paymentType?: string | null;
  paymentStatus?: string | null;
};

export default function RoutineBookingPricingCard({
  pricing,
  sessionCountFallback = 0,
  paymentType,
  paymentStatus,
}: RoutineBookingPricingCardProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const currency = pricing?.currency || 'USD';

  return (
    <View style={styles.card}>
      <RoutineDetailKeyValueRow
        label={t('routineBooking.sessions')}
        value={String(pricing?.sessionCount ?? sessionCountFallback)}
      />
      <RoutineDetailKeyValueRow
        label={t('routineBooking.subtotal')}
        value={centsToDisplay(pricing?.subtotalCents, currency)}
      />
      <RoutineDetailKeyValueRow
        label={t('routineBooking.volumeDiscount')}
        value={
          <View style={styles.discountCol}>
            <CustomText style={[styles.value, styles.discountValue]}>
              -{centsToDisplay(pricing?.discountAmountCents, currency)}
            </CustomText>
            {pricing?.discountTierLabel ? (
              <CustomText style={styles.tierHint}>
                {pricing.discountPct}% · {pricing.discountTierLabel}
              </CustomText>
            ) : null}
          </View>
        }
      />
      <RoutineDetailKeyValueRow
        label={t('routineBooking.total')}
        value={
          <CustomText style={[styles.value, styles.totalValue]}>
            {centsToDisplay(pricing?.totalCents, currency)}
          </CustomText>
        }
      />

      <View style={styles.divider} />

      <RoutineDetailKeyValueRow
        label={t('routineBooking.paymentType')}
        value={
          <CustomText style={styles.paymentValue}>
            {paymentType || '—'}
          </CustomText>
        }
      />
      <RoutineDetailKeyValueRow
        label={t('routineBooking.paymentStatus')}
        value={
          <CustomText style={styles.paymentValue}>
            {paymentStatus || '—'}
          </CustomText>
        }
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
      padding: theme.SW(16),
    },
    discountCol: {
      alignItems: 'flex-end',
    },
    value: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.text,
      textAlign: 'right',
    },
    discountValue: {
      color: '#2E7D32',
    },
    totalValue: {
      color: theme.colors.primary,
    },
    tierHint: {
      marginTop: theme.SH(2),
      fontSize: theme.fontSize.xs,
      color: theme.colors.lightText,
      textAlign: 'right',
    },
    divider: {
      marginVertical: theme.SH(6),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#EEE',
    },
    paymentValue: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      textTransform: 'capitalize',
    },
  });
