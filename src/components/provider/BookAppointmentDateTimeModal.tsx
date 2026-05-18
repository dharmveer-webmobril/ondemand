import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useGetServiceProviderAvailability } from '@services/index';
import { generateTimeSlots } from '@utils/timeSlotUtils';
import {
  ROUTINE_MAX_DAYS_AHEAD,
  formatDateDisplay,
} from '@utils/routineVolumeDiscount';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export type BookAppointmentDateTimeModalProps = {
  visible: boolean;
  providerId: string;
  mode: 'single' | 'routine';
  initialDate?: string;
  initialTime?: string | null;
  minDate: string;
  maxDate?: string;
  onClose: () => void;
  onConfirmSingle: (date: string, time: string) => void;
  onAddRoutineSession: (date: string, time: string) => void;
  routineSessionCount?: number;
  maxRoutineSessions?: number;
  /** Milliseconds before slot start required for routine (from service routineConfig). */
  routineAdvanceNoticeMs?: number;
};

export default function BookAppointmentDateTimeModal({
  visible,
  providerId,
  mode,
  initialDate,
  initialTime,
  minDate,
  maxDate,
  onClose,
  onConfirmSingle,
  onAddRoutineSession,
  routineSessionCount = 0,
  maxRoutineSessions = 24,
  routineAdvanceNoticeMs = 24 * 60 * 60 * 1000,
}: BookAppointmentDateTimeModalProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const todayString = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return formatDateToString(d);
  }, []);

  const [selectedDateString, setSelectedDateString] = useState(
    initialDate || minDate,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialTime ?? null,
  );
  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = initialDate || minDate;
    return base.slice(0, 7);
  });

  useEffect(() => {
    if (!visible) return;
    setSelectedDateString(initialDate || minDate);
    setSelectedTime(initialTime ?? null);
    setCurrentMonth((initialDate || minDate).slice(0, 7));
  }, [visible, initialDate, initialTime, minDate]);

  const {
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isFetching: isFetchingAvailability,
    isError: isErrorAvailability,
  } = useGetServiceProviderAvailability(
    providerId,
    selectedDateString,
    visible,
  );

  const timeSlots = useMemo(() => {
    if (!availabilityData?.ResponseData?.availability) return [];
    const availability = availabilityData.ResponseData.availability;
    if (!availabilityData.ResponseData.available || availability.close) {
      return [];
    }
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.close,
    );

    const isToday = selectedDateString === todayString;
    const isRoutineMinDay =
      mode === 'routine' && selectedDateString === minDate;

    if (isToday || isRoutineMinDay) {
      const now = new Date();
      const advanceMs =
        mode === 'routine' ? routineAdvanceNoticeMs : 60 * 30 * 1000;
      const cutoff = new Date(now.getTime() + advanceMs);
      return slots.filter(slot => {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0,
          0,
        );
        if (selectedDateString !== todayString) {
          const [y, m, d] = selectedDateString.split('-').map(Number);
          slotDate.setFullYear(y, m - 1, d);
        }
        return slotDate >= cutoff;
      });
    }

    return slots;
  }, [availabilityData, selectedDateString, todayString, minDate, mode]);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDateString(day.dateString);
    setSelectedTime(null);
    setCurrentMonth(day.dateString.slice(0, 7));
  }, []);

  const handleMonthChange = useCallback(
    (month: { month: number; year: number }) => {
      setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}`);
    },
    [],
  );

  const markedDates = useMemo(
    () => ({
      [selectedDateString]: {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: theme.colors.white,
      },
    }),
    [selectedDateString, theme.colors.primary, theme.colors.white],
  );

  const handleConfirm = () => {
    if (!selectedTime) return;
    if (mode === 'single') {
      onConfirmSingle(selectedDateString, selectedTime);
      onClose();
      return;
    }
    if (routineSessionCount >= maxRoutineSessions) return;
    onAddRoutineSession(selectedDateString, selectedTime);
    onClose();
  };

  const renderCalendarArrow = useCallback(
    (direction: 'left' | 'right') => (
      <VectoreIcons
        name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
        icon="Ionicons"
        size={theme.SF(26)}
        color={theme.colors.primary || '#009BFF'}
      />
    ),
    [theme.SF, theme.colors.primary],
  );

  const maxDateLabel = maxDate ? formatDateDisplay(maxDate) : '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.header}>
              <CustomText style={styles.title}>
                {mode === 'single'
                  ? t('bookAppointment.selectDateTime')
                  : t('bookAppointment.addRoutineSession')}
              </CustomText>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {mode === 'routine' && maxDate ? (
                <CustomText style={styles.hint}>
                  {t('bookAppointment.routineDateHint', {
                    maxDate: maxDateLabel,
                    days: ROUTINE_MAX_DAYS_AHEAD,
                  })}
                </CustomText>
              ) : null}

              <Calendar
                current={currentMonth}
                onDayPress={handleDayPress}
                onMonthChange={handleMonthChange}
                markedDates={markedDates}
                minDate={minDate}
                maxDate={maxDate}
                enableSwipeMonths
                renderArrow={renderCalendarArrow}
                theme={
                  {
                    backgroundColor: theme.colors.white,
                    calendarBackground: theme.colors.white,
                    textSectionTitleColor: theme.colors.text,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: theme.colors.white,
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.text,
                    textDisabledColor: theme.colors.lightText,
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.text,
                  } as any
                }
                style={styles.calendar}
              />

              <CustomText style={styles.sectionTitle}>
                {t('bookAppointment.selectTime')}
              </CustomText>

              {isLoadingAvailability || isFetchingAvailability ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <CustomText style={styles.loaderText}>
                    {t('bookAppointment.loadingSlots')}
                  </CustomText>
                </View>
              ) : isErrorAvailability ||
                !availabilityData?.ResponseData?.available ||
                timeSlots.length === 0 ? (
                <CustomText style={styles.emptySlots}>
                  {t('bookAppointment.noSlotsAvailable')}
                </CustomText>
              ) : (
                <FlatList
                  data={timeSlots}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.slotsRow}
                  renderItem={({ item }) => {
                    const isSelected = selectedTime === item.time;
                    return (
                      <Pressable
                        onPress={() =>
                          item.available && setSelectedTime(item.time)
                        }
                        disabled={!item.available}
                        style={[
                          styles.slot,
                          isSelected && styles.slotSelected,
                          !item.available && styles.slotDisabled,
                        ]}
                      >
                        <CustomText
                          style={[
                            styles.slotText,
                            isSelected && styles.slotTextSelected,
                          ]}
                        >
                          {item.time}
                        </CustomText>
                      </Pressable>
                    );
                  }}
                />
              )}
            </ScrollView>

            <View style={styles.footer}>
              <CustomButton
                title={
                  mode === 'single'
                    ? t('bookAppointment.confirmDateTime')
                    : t('bookAppointment.addToRoutine')
                }
                onPress={handleConfirm}
                disable={!selectedTime}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.whitetext}
                buttonStyle={styles.confirmBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '92%',
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.SF(16),
      borderTopRightRadius: theme.SF(16),
      paddingBottom: theme.SH(16),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW(20),
      paddingVertical: theme.SH(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray || '#EEE',
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.SW(8),
    },
    scrollContent: {
      paddingHorizontal: theme.SW(16),
      paddingBottom: theme.SH(12),
    },
    hint: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: theme.SH(12),
      marginBottom: theme.SH(4),
    },
    calendar: {
      marginTop: theme.SH(8),
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginTop: theme.SH(16),
      marginBottom: theme.SH(12),
    },
    loaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
      paddingVertical: theme.SH(12),
    },
    loaderText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.lightText,
    },
    emptySlots: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.lightText,
      textAlign: 'center',
      paddingVertical: theme.SH(12),
    },
    slotsRow: {
      gap: theme.SW(10),
      paddingBottom: theme.SH(8),
    },
    slot: {
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(10),
      borderRadius: theme.SF(8),
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E0E0E0',
    },
    slotSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    slotDisabled: {
      opacity: 0.45,
    },
    slotText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    slotTextSelected: {
      color: theme.colors.white,
    },
    footer: {
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(8),
    },
    confirmBtn: {
      borderRadius: theme.SF(12),
    },
  });
