import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { CustomText, CustomButton, VectoreIcons, CustomInput, LoadingComp } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { generateTimeSlots } from '@utils/timeSlotUtils';
import { useGetServiceProviderAvailability } from '@services/index';

// Format date to YYYY-MM-DD
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type RescheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, reason: string) => void;
  currentDate: string;
  currentTime: string;
  spId?: string | null;
  isLoading?: boolean;
};

export default function RescheduleModal({
  visible,
  onClose,
  onConfirm,
  currentDate,
  currentTime: _currentTime,
  spId,
  isLoading = false,
}: RescheduleModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const todayString = useMemo(() => formatDateToString(today), [today]);

  // Parse current date to set initial selected date
  const initialDate = useMemo(() => {
    try {
      // Try to parse currentDate (could be in various formats)
      const parsed = new Date(currentDate);
      if (!isNaN(parsed.getTime())) {
        const formatted = formatDateToString(parsed);
        return parsed >= today ? formatted : todayString;
      }
    } catch {
      // If parsing fails, use today
    }
    return todayString;
  }, [currentDate, today, todayString]);

  const [selectedDateString, setSelectedDateString] = useState<string>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');

  // Fetch availability for selected date
  const {
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
    isFetching: isFetchingAvailability,
  } = useGetServiceProviderAvailability(spId || null, selectedDateString);

  // Generate time slots based on availability (in 24-hour format)
  const timeSlots = useMemo(() => {
    if (!availabilityData?.ResponseData?.availability) {
      return [];
    }
    const availability = availabilityData.ResponseData.availability;
    if (!availabilityData.ResponseData.available || availability.close) {
      return [];
    }
    return generateTimeSlots(availability.startTime, availability.endTime, availability.close);
  }, [availabilityData]);

  // Handle date selection from Calendar
  const handleDayPress = useCallback((day: DateData) => {
    const selectedDate = new Date(day.dateString);
    selectedDate.setHours(0, 0, 0, 0);

    // Don't allow selecting past dates
    if (selectedDate < today) {
      return;
    }

    setSelectedDateString(day.dateString);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  }, [today]);

  // Handle month change
  const handleMonthChange = useCallback((month: { month: number; year: number }) => {
    const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`;
    setCurrentMonth(monthString);
  }, []);

  // Marked dates for calendar
  const markedDates = useMemo(() => {
    return {
      [selectedDateString]: {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: theme.colors.white,
      },
    };
  }, [selectedDateString, theme.colors.primary, theme.colors.white]);

  const handleConfirm = useCallback(() => {
    if (selectedDateString && selectedTimeSlot && reason.trim()) {
      const selectedTime = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (selectedTime) {
        onConfirm(selectedDateString, selectedTime.time, reason.trim());
        // Reset form
        setReason('');
        setSelectedTimeSlot(null);
      }
    }
  }, [selectedDateString, selectedTimeSlot, reason, timeSlots, onConfirm]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setReason('');
      setSelectedTimeSlot(null);
      setSelectedDateString(initialDate);
      onClose();
    }
  }, [onClose, initialDate, isLoading]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <CustomText
              fontSize={theme.fontSize.lg}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.text}
            >
              Reschedule Booking
            </CustomText>
            <Pressable onPress={handleClose} style={styles.closeButton} disabled={isLoading}>
              <VectoreIcons
                name="close"
                icon="Ionicons"
                size={theme.SF(24)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendar Section */}
            <View style={styles.section}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                style={{ marginBottom: theme.SH(12) }}
              >
                Select Date
              </CustomText>
              <View style={styles.calendarContainer}>
                <Calendar
                  current={currentMonth}
                  onDayPress={handleDayPress}
                  onMonthChange={handleMonthChange}
                  markedDates={markedDates}
                  minDate={todayString}
                  disableAllTouchEventsForDisabledDays
                  enableSwipeMonths
                  theme={{
                    backgroundColor: theme.colors.white,
                    calendarBackground: theme.colors.white,
                    textSectionTitleColor: theme.colors.text,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: theme.colors.white,
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.text,
                    textDisabledColor: theme.colors.lightText,
                    dotColor: theme.colors.primary,
                    selectedDotColor: theme.colors.white,
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.text,
                    textDayFontFamily: theme.fonts.REGULAR,
                    textMonthFontFamily: theme.fonts.SEMI_BOLD,
                    textDayHeaderFontFamily: theme.fonts.MEDIUM,
                    textDayFontSize: theme.fontSize.sm,
                    textMonthFontSize: theme.fontSize.lg,
                    textDayHeaderFontSize: theme.fontSize.xs,
                  } as any}
                  style={styles.calendar}
                />
              </View>
            </View>

            {/* Time Slots Section */}
            <View style={styles.section}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                style={{ marginBottom: theme.SH(12) }}
              >
                Select Time
              </CustomText>
              {isLoadingAvailability || isFetchingAvailability ? (
                <View style={styles.slotsLoaderContainer}>
                  <LoadingComp visible={true} />
                  <CustomText
                    fontSize={theme.fontSize.sm}
                    fontFamily={theme.fonts.REGULAR}
                    color={theme.colors.lightText}
                    style={{ marginTop: theme.SH(8) }}
                  >
                    Loading available slots...
                  </CustomText>
                </View>
              ) : isErrorAvailability || !availabilityData?.ResponseData?.available || timeSlots.length === 0 ? (
                <View style={styles.notAvailableContainer}>
                  <CustomText
                    fontSize={theme.fontSize.sm}
                    fontFamily={theme.fonts.REGULAR}
                    color={theme.colors.lightText}
                    textAlign="center"
                  >
                    {isErrorAvailability
                      ? 'Not available'
                      : availabilityData?.ResponseData?.availability?.close
                        ? 'Closed on this date'
                        : 'No slots available for this date'}
                  </CustomText>
                </View>
              ) : (
                <FlatList
                  data={timeSlots}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.timeSlotsContainer}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = selectedTimeSlot === item.id;
                    const isAvailable = item.available;
                    return (
                      <Pressable
                        onPress={() => { isAvailable && setSelectedTimeSlot(item.id); }}
                        disabled={!isAvailable}
                        style={({ pressed }) => [
                          styles.timeSlot,
                          isSelected && styles.selectedTimeSlot,
                          !isAvailable && styles.unavailableTimeSlot,
                          pressed && isAvailable && { opacity: 0.7 },
                        ]}
                      >
                        <CustomText
                          style={[
                            styles.timeSlotText,
                            isSelected ? styles.selectedTimeSlotText : {},
                            !isAvailable ? styles.unavailableText : {},
                          ]}
                        >
                          {item.time}
                        </CustomText>
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>

            {/* Reason Input Section */}
            <View style={styles.section}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                style={{ marginBottom: theme.SH(12) }}
              >
                Reason for Rescheduling
              </CustomText>
              <CustomText
                fontSize={theme.fontSize.sm}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
                style={{ marginBottom: theme.SH(8) }}
              >
                Please provide a reason for rescheduling (required)
              </CustomText>
              <CustomInput
                placeholder="Enter reason for rescheduling..."
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                maxLength={500}
                inputTheme="default"
                withBackground={theme.colors.secondary}
                isEditable={!isLoading}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <CustomButton
              title="Cancel"
              onPress={handleClose}
              backgroundColor={theme.colors.secondary}
              textColor={theme.colors.text}
              buttonStyle={styles.cancelButton}
              disable={isLoading}
            />
            <CustomButton
              title="Confirm"
              onPress={handleConfirm}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              buttonStyle={styles.confirmButton}
              disable={!selectedDateString || !selectedTimeSlot || !reason.trim() || isLoading}
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? theme.SH(30) : theme.SH(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.SW(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    closeButton: {
      width: theme.SF(32),
      height: theme.SF(32),
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flexGrow: 1,
    },
    content: {
      padding: theme.SW(16),
    },
    section: {
      marginBottom: theme.SH(24),
    },
    calendarContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    calendar: {
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.SH(10),
    },
    timeSlotsContainer: {
      gap: theme.SW(12),
      paddingVertical: theme.SH(8),
    },
    timeSlot: {
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(10),
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E0E0E0',
      backgroundColor: theme.colors.white,
    },
    selectedTimeSlot: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    unavailableTimeSlot: {
      opacity: 0.5,
    },
    timeSlotText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    selectedTimeSlotText: {
      color: theme.colors.white,
    },
    unavailableText: {
      color: theme.colors.lightText,
    },
    slotsLoaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.SW(12),
      paddingVertical: theme.SH(20),
    },
    notAvailableContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.SH(20),
    },
    footer: {
      flexDirection: 'row',
      padding: theme.SW(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
      gap: theme.SW(8),
    },
    cancelButton: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
    },
    confirmButton: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
    },
  });
