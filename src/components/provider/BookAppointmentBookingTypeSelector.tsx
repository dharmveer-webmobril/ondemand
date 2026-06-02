import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

export type BookingType = 'single' | 'routine';

type Props = {
  value: BookingType;
  onChange: (type: BookingType) => void;
};

export default function BookAppointmentBookingTypeSelector({
  value,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <CustomText style={styles.title}>
        {t('bookAppointment.bookingType')}
      </CustomText>
      <View style={styles.row}>
        <Pressable
          style={[styles.btn, value === 'single' && styles.btnActive]}
          onPress={() => onChange('single')}
        >
          <CustomText
            style={[styles.btnText, value === 'single' && styles.btnTextActive]}
          >
            {t('bookAppointment.singleBooking')}
          </CustomText>
        </Pressable>
        <Pressable
          style={[styles.btn, value === 'routine' && styles.btnActive]}
          onPress={() => onChange('routine')}
        >
          <CustomText
            style={[styles.btnText, value === 'routine' && styles.btnTextActive]}
          >
            {t('bookAppointment.routinePackage')}
          </CustomText>
        </Pressable>
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
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(10),
    },
    title: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    row: {
      flexDirection: 'row',
      gap: theme.SW(10),
      marginTop: theme.SH(12),
    },
    btn: {
      flex: 1,
      paddingVertical: theme.SH(6),
      borderRadius: theme.SF(10),
      borderWidth: 1,
      borderColor: theme.colors.primary,
      alignItems: 'center',
    },
    btnActive: {
      backgroundColor: theme.colors.primary,
    },
    btnText: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
    btnTextActive: {
      color: theme.colors.white,
    },
  });
