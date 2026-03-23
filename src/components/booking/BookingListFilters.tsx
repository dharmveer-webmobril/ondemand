import React, { memo, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';

export type BookingStatusOption = {
  value: string;
  labelKey?: string;
  label?: string;
};

type Props = {
  selectedStatus: string;
  selectedDate: string | null;
  onSelectStatus: (status: string) => void;
  onOpenCalendar: () => void;
  onClearDate: () => void;
  formatDateDisplay: (dateStr: string) => string;
  statusOptions: BookingStatusOption[];
};

function BookingListFiltersComponent({
  selectedStatus,
  selectedDate,
  onSelectStatus,
  onOpenCalendar,
  onClearDate,
  formatDateDisplay,
  statusOptions,
}: Props) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <>
      {selectedDate && (
        <View style={styles.dateFilterRow}>
          <CustomText style={styles.dateFilterLabel}>
            Date: {formatDateDisplay(selectedDate)}
          </CustomText>
          <Pressable onPress={onClearDate} style={styles.clearDateButton}>
            <CustomText style={styles.clearDateText}>Clear</CustomText>
          </Pressable>
        </View>
      )}

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={styles.statusFilterWrap}>
            <Menu>
              <MenuTrigger>
                <View style={styles.filterButton}>
                  <CustomText style={styles.filterButtonText}>
                    {t(
                      statusOptions.find(option => option.value === selectedStatus)?.labelKey ||
                        'myBookingScreen.filter.allBookings',
                    )}
                  </CustomText>
                  <CustomText style={styles.filterIcon}>▼</CustomText>
                </View>
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={styles.menuOptions}>
                {statusOptions.map(option => {
                  const isSelected = selectedStatus === option.value;
                  return (
                    <MenuOption
                      key={option.value}
                      onSelect={() => onSelectStatus(option.value)}
                      style={[
                        styles.menuOption,
                        isSelected ? styles.menuOptionSelected : {},
                      ]}
                    >
                      <CustomText
                        style={[
                          styles.menuOptionText,
                          isSelected ? styles.menuOptionTextSelected : {},
                        ]}
                      >
                        {option.labelKey ? t(option.labelKey) : option.label || ''}
                      </CustomText>
                    </MenuOption>
                  );
                })}
              </MenuOptions>
            </Menu>
          </View>

          <TouchableOpacity style={styles.calendarButton} onPress={onOpenCalendar}>
            <VectoreIcons
              name="calendar-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.primary}
            />
            <CustomText style={styles.calendarButtonText}>Date</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

export default memo(BookingListFiltersComponent);

const createStyles = (theme: any) =>
  StyleSheet.create({
    filterContainer: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(10),
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
    },
    statusFilterWrap: {
      flex: 1,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(12),
      borderRadius: theme.borderRadius.md || 8,
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E0E0E0',
    },
    filterButtonText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    filterIcon: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.lightText || '#999999',
      marginLeft: theme.SW(8),
    },
    calendarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.SW(6),
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(14),
      paddingVertical: theme.SH(12),
      borderRadius: theme.borderRadius.md || 8,
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E0E0E0',
    },
    calendarButtonText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.primary,
    },
    menuOptions: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md || 8,
      paddingVertical: theme.SH(8),
      marginTop: theme.SH(8),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    menuOption: {
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(12),
    },
    menuOptionSelected: {
      backgroundColor:
        theme.colors.primary_light || theme.colors.secondary || '#E3F2FD',
    },
    menuOptionText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
    },
    menuOptionTextSelected: {
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
    dateFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(8),
      backgroundColor: theme.colors.white,
      borderTopWidth: 0.5,
      borderBottomWidth: 0.5,
      borderTopColor: theme.colors.gray || '#E8E8E8',
      borderBottomColor: theme.colors.gray || '#E8E8E8',
      marginTop: theme.SH(10),
    },
    dateFilterLabel: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    clearDateButton: {
      paddingVertical: theme.SH(6),
      paddingHorizontal: theme.SW(12),
    },
    clearDateText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
  });

