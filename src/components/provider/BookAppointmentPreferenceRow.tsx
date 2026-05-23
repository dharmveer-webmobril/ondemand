import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

const DELIVERY_MODE_META: Record<
  string,
  { labelKey: string; icon: string; iconType: 'Ionicons' }
> = {
  online: {
    labelKey: 'home.servicePreference.online',
    icon: 'laptop-outline',
    iconType: 'Ionicons',
  },
  atHome: {
    labelKey: 'home.servicePreference.atHome',
    icon: 'home-outline',
    iconType: 'Ionicons',
  },
  onPremises: {
    labelKey: 'home.servicePreference.onPremises',
    icon: 'storefront-outline',
    iconType: 'Ionicons',
  },
};

type Props = {
  deliveryMode: string;
};

export default function BookAppointmentPreferenceRow({ deliveryMode }: Props) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const meta = DELIVERY_MODE_META[deliveryMode] ?? {
    labelKey: '',
    icon: 'location-outline',
    iconType: 'Ionicons' as const,
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <CustomText style={styles.label} numberOfLines={1}>
          {t('bookAppointment.selectedPreference')}
        </CustomText>
        <View style={styles.pill}>
          <VectoreIcons
            name={meta.icon}
            icon={meta.iconType}
            size={theme.SF(16)}
            color={theme.colors.primary}
          />
          <CustomText style={styles.pillText} numberOfLines={1}>
            {meta.labelKey ? t(meta.labelKey) : deliveryMode || '—'}
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.SW(10),
    },
    label: {
      flexShrink: 1,
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      gap: theme.SW(4),
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(1),
      borderRadius: theme.SF(20),
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    pillText: {
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
  });
