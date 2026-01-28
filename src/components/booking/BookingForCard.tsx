import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type BookingForCardProps = {
  bookedFor: 'self' | 'other';
};

export default function BookingForCard({ bookedFor }: BookingForCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <CustomText
        fontSize={theme.fontSize.md}
        fontFamily={theme.fonts.SEMI_BOLD}
        color={theme.colors.text}
      >
        Booking For
      </CustomText>
      <View style={styles.detailRow}>
        <VectoreIcons
          name={bookedFor === 'self' ? 'person' : 'people'}
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
          {bookedFor === 'self' ? 'Self' : 'Other Person'}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      marginLeft: theme.SW(12),
      // flex: 1,
    },
    titleContainer: {
      marginBottom: theme.SH(12),
    },
  });
