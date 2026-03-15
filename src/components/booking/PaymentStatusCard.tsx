import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type PaymentStatusCardProps = {
  paymentStatus: string;
  paymentType: string;
};

export default function PaymentStatusCard({
  paymentStatus,
  paymentType,
}: PaymentStatusCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <CustomText
          fontSize={theme.SF(15)}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          Payment Status
        </CustomText>
        <View style={styles.detailRow}>
          <>
            {/*  ̰ */}
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {paymentStatus === 'completed' ? 'Completed' : 'Pending'}
            </CustomText>
          </>
        </View>
      </View>
      <View style={styles.card}>
        <CustomText
          fontSize={theme.SF(15)}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          Payment Type
        </CustomText>
        <View style={styles.detailRow}>
          <>
            {/*  ̰ */}
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {paymentType === 'wallet_partial' ? 'Partial Wallet' : paymentType === 'wallet' ? 'Full Wallet' : paymentType === 'online' ? 'Online' : 'Cash'}
            </CustomText>
          </>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
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
    card: {
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
