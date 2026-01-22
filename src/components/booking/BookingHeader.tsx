import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type BookingHeaderProps = {
  bookingId: string;
  status: string;
  statusColor: string;
};

export default function BookingHeader({ bookingId, status, statusColor }: BookingHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme, statusColor), [theme, statusColor]);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.bookingIdContainer}>
          <CustomText
            fontSize={theme.fontSize.xs}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText}
          >
            Booking ID
          </CustomText>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
            marginTop={theme.SH(4)}
          >
            {bookingId}
          </CustomText>
        </View>
        <View style={styles.statusBadge}>
          <CustomText
            fontSize={theme.fontSize.xxs}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.white}
          >
            {status}
          </CustomText>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType, statusColor: string) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.SH(16),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.SH(12),
    },
    bookingIdContainer: {
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: theme.SW(12),
      paddingVertical: theme.SH(6),
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
      backgroundColor: statusColor,
    },
  });
