import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

type RescheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  currentDate: string;
  currentTime: string;
};

const generateCalendarDays = () => {
  const days = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dayOfWeek = date.getDay();
    const isToday = i === today.getDate();
    days.push({
      day: i,
      dayName: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      date: date,
      isToday,
    });
  }
  return days;
};

const timeSlots: TimeSlot[] = [
  { id: '1', time: '8:00 am', available: true },
  { id: '2', time: '8:30 am', available: true },
  { id: '3', time: '9:00 am', available: true },
  { id: '4', time: '9:30 am', available: true },
  { id: '5', time: '10:00 am', available: true },
  { id: '6', time: '10:30 am', available: true },
  { id: '7', time: '11:00 am', available: false },
  { id: '8', time: '11:30 am', available: true },
  { id: '9', time: '12:00 pm', available: true },
  { id: '10', time: '12:30 pm', available: true },
  { id: '11', time: '1:00 pm', available: true },
  { id: '12', time: '1:30 pm', available: true },
  { id: '13', time: '2:00 pm', available: true },
  { id: '14', time: '2:30 pm', available: true },
  { id: '15', time: '3:00 pm', available: true },
  { id: '16', time: '3:30 pm', available: true },
  { id: '17', time: '4:00 pm', available: true },
  { id: '18', time: '4:30 pm', available: true },
  { id: '19', time: '5:00 pm', available: true },
  { id: '20', time: '5:30 pm', available: true },
];

export default function RescheduleModal({
  visible,
  onClose,
  onConfirm,
  currentDate,
  currentTime,
}: RescheduleModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const calendarDays = useMemo(() => generateCalendarDays(), []);
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const handleConfirm = useCallback(() => {
    if (selectedDate && selectedTimeSlot) {
      const selectedTime = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (selectedTime) {
        const dateStr = `${selectedDate}-${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}`;
        onConfirm(dateStr, selectedTime.time);
      }
    }
  }, [selectedDate, selectedTimeSlot, onConfirm]);

  const formatDate = useCallback((day: number) => {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    return date.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
            <Pressable onPress={onClose} style={styles.closeButton}>
              <VectoreIcons
                name="close"
                icon="Ionicons"
                size={theme.SF(24)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Date Selection */}
            <View style={styles.section}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                marginBottom={theme.SH(12)}
              >
                Select Date
              </CustomText>
              <CustomText
                fontSize={theme.fontSize.sm}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
                marginBottom={theme.SH(12)}
              >
                {monthName}
              </CustomText>
              <FlatList
                data={calendarDays}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.day.toString()}
                contentContainerStyle={styles.calendarContainer}
                renderItem={({ item }) => {
                  const isSelected = selectedDate === item.day;
                  return (
                    <Pressable
                      onPress={() => setSelectedDate(item.day)}
                      style={({ pressed }) => [
                        styles.dateItem,
                        isSelected && styles.selectedDateItem,
                        item.isToday && !isSelected && styles.todayDateItem,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <CustomText
                        fontSize={theme.fontSize.xxs}
                        fontFamily={theme.fonts.REGULAR}
                        color={isSelected ? theme.colors.white : theme.colors.lightText}
                      >
                        {item.dayName}
                      </CustomText>
                      <CustomText
                        fontSize={theme.fontSize.sm}
                        fontFamily={theme.fonts.SEMI_BOLD}
                        color={isSelected ? theme.colors.white : theme.colors.text}
                        marginTop={theme.SH(4)}
                      >
                        {item.day}
                      </CustomText>
                    </Pressable>
                  );
                }}
              />
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                marginBottom={theme.SH(12)}
              >
                Select Time
              </CustomText>
              <FlatList
                data={timeSlots}
                numColumns={4}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.timeSlotsContainer}
                renderItem={({ item }) => {
                  const isSelected = selectedTimeSlot === item.id;
                  return (
                    <Pressable
                      onPress={() => item.available && setSelectedTimeSlot(item.id)}
                      disabled={!item.available}
                      style={({ pressed }) => [
                        styles.timeSlot,
                        isSelected && styles.selectedTimeSlot,
                        !item.available && styles.unavailableTimeSlot,
                        pressed && item.available && { opacity: 0.7 },
                      ]}
                    >
                      <CustomText
                        fontSize={theme.fontSize.xs}
                        fontFamily={theme.fonts.MEDIUM}
                        color={
                          isSelected
                            ? theme.colors.white
                            : !item.available
                            ? theme.colors.lightText
                            : theme.colors.text
                        }
                      >
                        {item.time}
                      </CustomText>
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <CustomButton
              title="Cancel"
              onPress={onClose}
              backgroundColor={theme.colors.secondary}
              textColor={theme.colors.text}
              buttonStyle={styles.cancelButton}
              marginRight={theme.SW(8)}
            />
            <CustomButton
              title="Confirm"
              onPress={handleConfirm}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              buttonStyle={styles.confirmButton}
              disable={!selectedDate || !selectedTimeSlot}
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
    content: {
      padding: theme.SW(16),
      maxHeight: '70%',
    },
    section: {
      marginBottom: theme.SH(24),
    },
    calendarContainer: {
      paddingVertical: theme.SH(8),
    },
    dateItem: {
      width: theme.SW(50),
      height: theme.SH(70),
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.SW(8),
    },
    selectedDateItem: {
      backgroundColor: theme.colors.primary,
    },
    todayDateItem: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    timeSlotsContainer: {
      paddingVertical: theme.SH(8),
    },
    timeSlot: {
      flex: 1,
      minWidth: '22%',
      margin: theme.SW(4),
      paddingVertical: theme.SH(12),
      paddingHorizontal: theme.SW(8),
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedTimeSlot: {
      backgroundColor: theme.colors.primary,
    },
    unavailableTimeSlot: {
      opacity: 0.5,
    },
    footer: {
      flexDirection: 'row',
      padding: theme.SW(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
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
