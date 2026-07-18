import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AnimatedEnter, AnimatedPressable, CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  centsToDisplay,
  formatProRespondBy,
  formatRoutineStatusLabel,
  getRoutineStatusColor,
} from '@utils/routineBookingHelpers';

type Props = {
  routineBookingId: string;
  sessionCount: number;
  totalCents: number;
  currency?: string;
  routineStatus: string;
  proRespondBy?: string | null;
  onPress?: () => void;
  index?: number;
};

export default function RoutineBookingCard({
  routineBookingId,
  sessionCount,
  totalCents,
  currency = 'USD',
  routineStatus,
  proRespondBy,
  onPress,
  index = 0,
}: Props) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const statusColor = getRoutineStatusColor(routineStatus);
  const statusLabel = formatRoutineStatusLabel(routineStatus, t);
  const totalLabel = centsToDisplay(totalCents, currency);
  const deadline = formatProRespondBy(proRespondBy);

  return (
    <AnimatedEnter index={index}>
      <AnimatedPressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <CustomText style={styles.bookingId} numberOfLines={1}>
          {routineBookingId}
        </CustomText>
        <View style={[styles.badge, { backgroundColor: `${statusColor}22` }]}>
          <CustomText style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </CustomText>
        </View>
      </View>

      <CustomText style={styles.meta}>
        {t('routineBooking.sessionsCount', { count: sessionCount })} · {totalLabel}
      </CustomText>

      {deadline ? (
        <CustomText style={styles.deadline}>
          {t('routineBooking.providerDeadline', { date: deadline })}
        </CustomText>
      ) : null}
    </AnimatedPressable>
    </AnimatedEnter>
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
      marginBottom: theme.SH(12),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.SW(8),
    },
    bookingId: {
      flex: 1,
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.text,
    },
    badge: {
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderRadius: theme.SF(14),
      maxWidth: '48%',
    },
    badgeText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.SEMI_BOLD,
      textTransform: 'lowercase',
    },
    meta: {
      marginTop: theme.SH(8),
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    deadline: {
      marginTop: theme.SH(6),
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
  });
