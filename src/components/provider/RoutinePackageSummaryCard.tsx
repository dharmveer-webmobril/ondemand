import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import type { VolumeDiscountTier } from '@utils/routineVolumeDiscount';

type Props = {
  packageSubtotal: number;
  discountAmount: number;
  totalPrice: number;
  activeTier: VolumeDiscountTier | null;
};

export default function RoutinePackageSummaryCard({
  packageSubtotal,
  discountAmount,
  totalPrice,
  activeTier,
}: Props) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <CustomText style={styles.title}>
        {t('bookAppointment.packageSummary')}
      </CustomText>
      <View style={styles.row}>
        <CustomText style={styles.label}>
          {t('bookAppointment.subtotal')}
        </CustomText>
        <CustomText style={styles.value}>
          ${packageSubtotal.toFixed(2)}
        </CustomText>
      </View>
      {activeTier ? (
        <View style={styles.row}>
          <CustomText style={styles.label}>
            {t('bookAppointment.volumeDiscount', {
              percent: activeTier.discountPercent,
              tier: activeTier.tier,
            })}
          </CustomText>
          <CustomText style={[styles.value, styles.discount]}>
            −${discountAmount.toFixed(2)}
          </CustomText>
        </View>
      ) : null}
      <View style={[styles.row, styles.totalRow]}>
        <CustomText style={styles.totalLabel}>
          {t('bookAppointment.packageTotal')}
        </CustomText>
        <CustomText style={styles.totalValue}>
          ${totalPrice.toFixed(2)}
        </CustomText>
      </View>
      <CustomText style={styles.note}>
        {t('bookAppointment.routineNoPromos')}
      </CustomText>
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
    title: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(8),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.SH(8),
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    value: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    discount: {
      color: '#2E7D32',
    },
    totalRow: {
      marginTop: theme.SH(12),
      paddingTop: theme.SH(12),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray || '#EEE',
    },
    totalLabel: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.primary,
    },
    note: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: theme.SH(8),
      fontStyle: 'italic',
    },
  });
