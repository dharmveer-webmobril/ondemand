import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

export type BookingListScope = 'general' | 'routine';

type Props = {
  value: BookingListScope;
  onChange: (scope: BookingListScope) => void;
};

export default function BookingListScopeTabs({ value, onChange }: Props) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const tabs: { key: BookingListScope; label: string }[] = [
    { key: 'general', label: t('routineBooking.scope.general') },
    { key: 'routine', label: t('routineBooking.scope.routine') },
  ];

  return (
    <View style={styles.row}>
      {tabs.map(tab => {
        const active = value === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(tab.key)}
          >
            <CustomText style={[styles.tabText, active && styles.tabTextActive]}>
              {tab.label}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      marginHorizontal: theme.SW(16),
      marginBottom: theme.SH(12),
      borderRadius: theme.SF(10),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E0E0E0',
      overflow: 'hidden',
    },
    tab: {
      flex: 1,
      paddingVertical: theme.SH(12),
      alignItems: 'center',
      backgroundColor: theme.colors.white,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    tabTextActive: {
      color: theme.colors.white,
    },
  });
