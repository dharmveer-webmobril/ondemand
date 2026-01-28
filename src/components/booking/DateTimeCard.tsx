import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText,  VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type DateTimeCardProps = {
  date: string;
  time: string;
  onReschedule?: () => void;
};

export default function DateTimeCard({ date, time }: DateTimeCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <CustomText
          fontSize={theme.fontSize.md}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          Date & Time
        </CustomText>
      </View>
      <View style={styles.detailRow}>
        <VectoreIcons
          name="calendar-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.text}
          style={styles.detailText}
        >
          {date}
        </CustomText>
      </View>
      <View style={styles.detailRow}>
        <VectoreIcons
          name="time-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.text}
          style={styles.detailText}
        >
          {time}
        </CustomText>
      </View>
     
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(10),
      marginBottom: theme.SH(10),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(8),
    },
    detailText: {
      marginLeft: theme.SW(12),
      flex: 1,
    },
    rescheduleButton: {
      borderRadius: theme.borderRadius.md,
    },
    rescheduleButtonText: {
      fontSize: theme.fontSize.sm,
    },
    titleContainer: {
      marginBottom: theme.SH(10),
    },
  });
