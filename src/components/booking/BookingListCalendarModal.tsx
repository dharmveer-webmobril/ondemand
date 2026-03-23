import React, { memo, useMemo } from 'react';
import { Modal, Pressable, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useThemeContext } from '@utils/theme';
import { CalendarArrow, CustomText, VectoreIcons } from '@components/common';

type Props = {
  visible: boolean;
  currentMonth: string;
  selectedDate: string | null;
  onClose: () => void;
  onDateSelect: (day: DateData) => void;
};

function BookingListCalendarModalComponent({
  visible,
  currentMonth,
  selectedDate,
  onClose,
  onDateSelect,
}: Props) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>Select Date</CustomText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <VectoreIcons
                name="close"
                size={24}
                icon="Ionicons"
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <Calendar
            key={currentMonth}
            current={currentMonth}
            onDayPress={onDateSelect}
            renderArrow={(direction: 'left' | 'right') => (
              <CalendarArrow
                direction={direction}
                color={theme.colors.primary || '#009BFF'}
                size={theme.SF(26)}
              />
            )}
            markedDates={
              selectedDate
                ? {
                    [selectedDate]: {
                      selected: true,
                      selectedColor: theme.colors.primary,
                    },
                  }
                : {}
            }
            theme={{
              calendarBackground: theme.colors.white,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.white,
              todayTextColor: theme.colors.primary,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              textDayFontFamily: theme.fonts?.REGULAR,
              textMonthFontFamily: theme.fonts?.BOLD,
              textDayHeaderFontFamily: theme.fonts?.MEDIUM,
            }}
            style={styles.calendar}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

export default memo(BookingListCalendarModalComponent);

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.SW(20),
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg || 12,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray || '#EEE',
    },
    modalTitle: {
      fontSize: theme.fontSize.lg,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    calendar: {
      paddingBottom: theme.SH(16),
    },
  });

