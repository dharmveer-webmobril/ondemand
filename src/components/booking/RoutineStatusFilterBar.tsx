import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import type { RoutineStatusFilter } from '@utils/routineBookingHelpers';

type FilterOption = {
  value: RoutineStatusFilter;
  labelKey: string;
};

const ROUTINE_FILTER_OPTIONS: FilterOption[] = [
  { value: '', labelKey: 'routineBooking.filter.all' },
  { value: 'pending', labelKey: 'routineBooking.filter.awaitingProvider' },
  { value: 'active', labelKey: 'routineBooking.filter.active' },
  { value: 'completed', labelKey: 'routineBooking.filter.completed' },
  { value: 'rejected', labelKey: 'routineBooking.filter.rejected' },
  { value: 'expired', labelKey: 'routineBooking.filter.expired' },
  { value: 'cancelled', labelKey: 'routineBooking.filter.cancelled' },
];

type Props = {
  selected: RoutineStatusFilter;
  onSelect: (value: RoutineStatusFilter) => void;
};

export default function RoutineStatusFilterBar({ selected, onSelect }: Props) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ROUTINE_FILTER_OPTIONS.map(option => {
          const active = selected === option.value;
          return (
            <Pressable
              key={option.value || 'all'}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(option.value)}
            >
              <CustomText
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {t(option.labelKey)}
              </CustomText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrap: {
      marginBottom: theme.SH(8),
    },
    scrollContent: {
      paddingHorizontal: theme.SW(16),
      gap: theme.SW(8),
    },
    chip: {
      paddingHorizontal: theme.SW(14),
      paddingVertical: theme.SH(8),
      borderRadius: theme.SF(20),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#DDD',
      backgroundColor: theme.colors.white,
    },
    chipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.secondary || '#E8F4FD',
    },
    chipText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    chipTextActive: {
      color: theme.colors.primary,
      fontFamily: theme.fonts.SEMI_BOLD,
    },
  });
