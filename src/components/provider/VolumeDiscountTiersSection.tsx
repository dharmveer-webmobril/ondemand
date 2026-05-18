import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  ROUTINE_MIN_SESSIONS,
  type VolumeDiscountTier,
} from '@utils/routineVolumeDiscount';
import BookAppointmentAccordion from './BookAppointmentAccordion';

type Props = {
  expanded: boolean;
  onToggle: () => void;
  sessionCount: number;
  activeTier: VolumeDiscountTier | null;
  discountTiers: VolumeDiscountTier[];
};

export default function VolumeDiscountTiersSection({
  expanded,
  onToggle,
  sessionCount,
  activeTier,
  discountTiers,
}: Props) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BookAppointmentAccordion
      title={t('bookAppointment.volumeDiscountTiers')}
      subtitle={t('bookAppointment.volumeDiscountSubtitle')}
      expanded={expanded}
      onToggle={onToggle}
    >
      <View style={styles.table}>
        <View style={[styles.row, styles.rowHeader]}>
          <CustomText style={styles.headCell}>
            {t('bookAppointment.sessionsCol')}
          </CustomText>
          <CustomText style={styles.headCell}>
            {t('bookAppointment.discountCol')}
          </CustomText>
          <CustomText style={styles.headCell}>
            {t('bookAppointment.tierCol')}
          </CustomText>
        </View>
        {discountTiers.map((tier) => {
          const isActive =
            activeTier?.tier === tier.tier &&
            sessionCount >= ROUTINE_MIN_SESSIONS;
          return (
            <View
              key={tier.tier}
              style={[styles.row, isActive && styles.rowActive]}
            >
              <CustomText style={[styles.cell, isActive && styles.cellActive]}>
                {tier.minSessions}–{tier.maxSessions}
              </CustomText>
              <CustomText style={[styles.cell, isActive && styles.cellActive]}>
                {tier.discountPercent}%
              </CustomText>
              <CustomText style={[styles.cell, isActive && styles.cellActive]}>
                {tier.tier}
                {isActive ? ' ✓' : ''}
              </CustomText>
            </View>
          );
        })}
      </View>

      {sessionCount >= ROUTINE_MIN_SESSIONS && activeTier ? (
        <View style={styles.banner}>
          <CustomText style={styles.bannerText}>
            {t('bookAppointment.currentTier', {
              tier: activeTier.tier,
              percent: activeTier.discountPercent,
              count: sessionCount,
            })}
          </CustomText>
        </View>
      ) : null}
    </BookAppointmentAccordion>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    table: {
      borderWidth: 1,
      borderColor: theme.colors.gray || '#EEE',
      borderRadius: theme.SF(8),
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray || '#EEE',
    },
    rowHeader: {
      backgroundColor: theme.colors.background || '#F5F5F5',
    },
    rowActive: {
      backgroundColor: '#E8F4FD',
    },
    headCell: {
      flex: 1,
      padding: theme.SW(10),
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    cell: {
      flex: 1,
      padding: theme.SW(10),
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
    },
    cellActive: {
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
    banner: {
      marginTop: theme.SH(12),
      padding: theme.SW(12),
      borderRadius: theme.SF(8),
      backgroundColor: '#E8F4FD',
    },
    bannerText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.primary,
    },
  });
