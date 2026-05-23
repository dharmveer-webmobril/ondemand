import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const paymentTypeLabel = (raw: string) => {
    if (raw === 'wallet_partial') return t('checkout.paymentModes.walletPartial');
    if (raw === 'wallet') return t('checkout.paymentModes.walletFull');
    if (raw === 'online') return t('checkout.paymentModes.online');
    if (raw === 'cash' || raw === 'onsite') return t('checkout.paymentModes.cash');
    return raw;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <CustomText
          fontSize={theme.SF(15)}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          {t('bookingDetails.paymentStatusTitle')}
        </CustomText>
        <View style={styles.detailRow}>
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.text}
            style={styles.detailText}
          >
            {paymentStatus === 'completed'
              ? t('wallet.filterCompleted')
              : t('wallet.filterPending')}
          </CustomText>
        </View>
      </View>
      <View style={styles.card}>
        <CustomText
          fontSize={theme.SF(15)}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          {t('bookingDetails.paymentTypeTitle')}
        </CustomText>
        <View style={styles.detailRow}>
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.text}
            style={styles.detailText}
          >
            {paymentTypeLabel(paymentType)}
          </CustomText>
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
