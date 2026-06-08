import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { formatAmount } from '@utils/formatAmount';
import RoutineDetailSection from './RoutineDetailSection';
import RoutineDetailKeyValueRow from './RoutineDetailKeyValueRow';
import type { RoutinePaymentBreakdownDisplay } from '@utils/routineBookingHelpers';

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
  breakdown: RoutinePaymentBreakdownDisplay;
  paymentType?: string | null;
  paymentStatus?: string | null;
  discountTierLabel?: string | null;
  discountPct?: number | null;
};

export default function RoutineBookingPricingCard({
  breakdown,
  paymentType,
  paymentStatus,
  discountTierLabel,
  discountPct,
}: RoutineBookingPricingCardProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);

  const {
    servicesAmount,
    addOnsAmount,
    perSessionSubtotal,
    sessionCount,
    packageSubtotal,
    discountAmount,
    total,
  } = breakdown;

  const showMultiply = sessionCount > 1;
  const showAddons = addOnsAmount > 0;
  const showDiscount = discountAmount > 0;

  return (
    <RoutineDetailSection title={t('routineBooking.paymentSection')}>
      <View style={styles.card}>
        <Pressable
          style={styles.accordionHeader}
          onPress={() => setExpanded(prev => !prev)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <CustomText style={styles.accordionTitle}>
            {t('routineBooking.total')}
          </CustomText>
          <View style={styles.accordionHeaderRight}>
            <CustomText style={styles.accordionTotal}>
              {formatAmount(total)}
            </CustomText>
            <VectoreIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              icon="Ionicons"
              size={theme.SF(20)}
              color={theme.colors.lightText}
            />
          </View>
        </Pressable>

        {expanded ? (
          <View style={styles.breakdown}>
            <RoutineDetailKeyValueRow
              label={t('routineBooking.paymentServicesAmount')}
              value={formatAmount(servicesAmount)}
              valueStyle={styles.rowValue}
            />
            {showAddons ? (
              <RoutineDetailKeyValueRow
                label={t('routineBooking.paymentAddonsAmount')}
                value={formatAmount(addOnsAmount)}
                valueStyle={styles.rowValue}
              />
            ) : null}
            {showMultiply ? (
              <RoutineDetailKeyValueRow
                label={t('routineBooking.paymentMultiplyAmount', {
                  perSession: formatAmount(perSessionSubtotal),
                  count: sessionCount,
                })}
                value={formatAmount(packageSubtotal)}
                valueStyle={styles.rowValue}
              />
            ) : (
              <RoutineDetailKeyValueRow
                label={t('routineBooking.subtotal')}
                value={formatAmount(packageSubtotal)}
                valueStyle={styles.rowValue}
              />
            )}
            {showDiscount ? (
              <RoutineDetailKeyValueRow
                label={t('routineBooking.volumeDiscount')}
                value={
                  <View style={styles.discountCol}>
                    <CustomText style={[styles.rowValue, styles.discountValue]}>
                      -{formatAmount(discountAmount)}
                    </CustomText>
                    {discountTierLabel ? (
                      <CustomText style={styles.tierHint}>
                        {discountPct}% · {discountTierLabel}
                      </CustomText>
                    ) : null}
                  </View>
                }
              />
            ) : null}
            <View style={styles.totalDivider} />
            <RoutineDetailKeyValueRow
              label={t('routineBooking.total')}
              value={
                <CustomText style={styles.breakdownTotalValue}>
                  {formatAmount(total)}
                </CustomText>
              }
            />

            <View style={styles.paymentDivider} />

            <RoutineDetailKeyValueRow
              label={t('routineBooking.paymentType')}
              value={
                <CustomText style={styles.paymentMeta}>
                  {paymentType || '—'}
                </CustomText>
              }
            />
            <RoutineDetailKeyValueRow
              label={t('routineBooking.paymentStatus')}
              value={
                <CustomText style={styles.paymentMeta}>
                  {paymentStatus || '—'}
                </CustomText>
              }
            />
          </View>
        ) : null}
      </View>
    </RoutineDetailSection>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E8E8E8',
      overflow: 'hidden',
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(14),
      gap: theme.SW(12),
    },
    accordionTitle: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      flex: 1,
    },
    accordionHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
    },
    accordionTotal: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.primary,
    },
    breakdown: {
      paddingHorizontal: theme.SW(16),
      paddingBottom: theme.SH(14),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#EEE',
    },
    rowValue: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    discountCol: {
      alignItems: 'flex-end',
    },
    discountValue: {
      color: '#2E7D32',
    },
    tierHint: {
      marginTop: theme.SH(2),
      fontSize: theme.fontSize.xs,
      color: theme.colors.lightText,
      textAlign: 'right',
    },
    totalDivider: {
      marginVertical: theme.SH(6),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#EEE',
    },
    breakdownTotalValue: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.primary,
      textAlign: 'right',
    },
    paymentDivider: {
      marginVertical: theme.SH(8),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.gray || '#EEE',
    },
    paymentMeta: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      textTransform: 'capitalize',
      textAlign: 'right',
    },
  });
