import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type RoutineBookingHeroCardProps = {
  statusLabel: string;
  statusColor: string;
  servicesInPackageLabel: string;
  providerSubtitle: string;
};

export default function RoutineBookingHeroCard({
  statusLabel,
  statusColor,
  servicesInPackageLabel,
  providerSubtitle,
}: RoutineBookingHeroCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <VectoreIcons
            name="calendar-outline"
            icon="Ionicons"
            size={theme.SF(28)}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.textBlock}>
          <CustomText style={styles.title}>{servicesInPackageLabel}</CustomText>
          <CustomText style={styles.sub}>{providerSubtitle}</CustomText>
        </View>
        <View style={[styles.badge, { backgroundColor: `${statusColor}22` }]}>
          <CustomText style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </CustomText>
        </View>
      </View>
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
    top: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.SW(12),
    },
    iconWrap: {
      width: theme.SF(48),
      height: theme.SF(48),
      borderRadius: theme.SF(24),
      backgroundColor: theme.colors.secondary || '#E8F4FD',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    sub: {
      marginTop: theme.SH(4),
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    badge: {
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(5),
      borderRadius: theme.SF(14),
      maxWidth: '36%',
    },
    badgeText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.SEMI_BOLD,
      textAlign: 'center',
    },
  });
