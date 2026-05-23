import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type BookingForCardProps = {
  type: 'bookedFor' | 'paymentStatus' | 'paymentType';
  value: string;
  title: string;
};

export default function BookingForCard({
  type,
  value,
  title,
}: BookingForCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const paymentTypeLabel = (raw: string) => {
    if (raw === 'wallet_partial') return t('checkout.paymentModes.walletPartial');
    if (raw === 'wallet') return t('checkout.paymentModes.walletFull');
    if (raw === 'online') return t('checkout.paymentModes.online');
    if (raw === 'cash' || raw === 'onsite') return t('checkout.paymentModes.cash');
    return raw;
  };

  return (
    <View style={styles.card}>
      <CustomText
        fontSize={theme.fontSize.md}
        fontFamily={theme.fonts.SEMI_BOLD}
        color={theme.colors.text}
      >
        {title}
      </CustomText>
      <View style={styles.detailRow}>
        {type === 'bookedFor' && (
          <>
            <VectoreIcons
              name={value === 'self' ? 'person' : 'people'}
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
              {value === 'self'
                ? t('bookingDetails.bookedForSelf')
                : t('bookingDetails.bookedForOther')}
            </CustomText>
          </>
        )}
        {type === 'paymentStatus' && (
          <>
            {/*  ̰ */}
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {value === 'completed'
                ? t('wallet.filterCompleted')
                : t('wallet.filterPending')}
            </CustomText>
          </>
        )}
        {type === 'paymentType' && (
          <>
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {paymentTypeLabel(value)}
            </CustomText>
          </>
        )}
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
