import { View, StyleSheet, ScrollView, Pressable, FlatList, ActivityIndicator } from 'react-native';
import React, { useMemo, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetServiceProviderAvailability } from '@services/index';
import { generateTimeSlots } from '@utils/timeSlotUtils';

// Format date to YYYY-MM-DD
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookAppointment() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation();
  
  // Get spId from route params
  const spId = route.params?.providerId || route.params?.provider?.id || route.params?.provider?._id || route.params?.spId;
  
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const todayString = useMemo(() => formatDateToString(today), [today]);
  
  // Get today's date as default selected date
  const [selectedDateString, setSelectedDateString] = useState<string>(todayString);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState([
    { id: '1', name: 'Haircut + Beard', price: 55.00, duration: '30m' },
  ]);

  // Fetch availability for selected date
  const {
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
    isFetching: isFetchingAvailability,
  } = useGetServiceProviderAvailability(spId, selectedDateString);

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

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const duration = parseInt(service.duration.replace('m', ''), 10);
      return sum + duration;
    }, 0);
  }, [selectedServices]);

  const handleRemoveService = (serviceId: string) => {
    if (selectedServices.length > 1) {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    }
  };

  const handleBook = () => {
    if (!selectedTimeSlot) {
      return;
    }
    // Handle booking
    navigation.goBack();
  };

  return (
    <Container safeArea={false} style={styles.container}>
      <AppHeader
        title="Book an Appointment"
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ paddingTop: insets.top }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Section */}
        <View style={styles.section}>
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

        {/* Time Slots */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Select Time</CustomText>
          {isLoadingAvailability || isFetchingAvailability ? (
            <View style={styles.slotsLoaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
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
                    onPress={() => isAvailable && setSelectedTimeSlot(item.id)}
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

        {/* Selected Services */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Selected Services</CustomText>
          {selectedServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <VectoreIcons
                  name="cut"
                  icon="Ionicons"
                  size={theme.SF(20)}
                  color={theme.colors.primary}
                />
                <View style={styles.serviceDetails}>
                  <CustomText style={styles.serviceName}>{service.name}</CustomText>
                  <CustomText style={styles.servicePrice}>
                    ${service.price.toFixed(2)} • {service.duration}
                  </CustomText>
                </View>
              </View>
              {selectedServices.length > 1 && (
                <Pressable
                  onPress={() => handleRemoveService(service.id)}
                  style={styles.removeButton}
                >
                  <VectoreIcons
                    name="close"
                    icon="Ionicons"
                    size={theme.SF(20)}
                    color={theme.colors.textAppColor || theme.colors.text}
                  />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable style={styles.addServiceButton}>
            <CustomText style={styles.addServiceText}>+ Add another service</CustomText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Booking Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <CustomText style={styles.summaryLabel}>
            ${totalPrice.toFixed(2)}
          </CustomText>
          <CustomText style={styles.summaryLabel}>
            {totalDuration}m
          </CustomText>
        </View>
        <CustomButton
          title="Book"
          onPress={handleBook}
          buttonStyle={styles.bookButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
          disable={!selectedTimeSlot}
        />
      </View>
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: SH(100),
    },
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(20),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(16),
    },
    calendarContainer: {
      backgroundColor: Colors.white,
      borderRadius: SF(12),
      overflow: 'hidden',
    },
    calendar: {
      borderRadius: SF(12),
      paddingVertical: SH(10),
    },
    timeSlotsContainer: {
      gap: SW(12),
    },
    slotsLoaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SW(12),
    },
    notAvailableContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeSlot: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(10),
      borderRadius: SF(8),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      backgroundColor: Colors.white,
    },
    selectedTimeSlot: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    unavailableTimeSlot: {
      opacity: 0.5,
    },
    timeSlotText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    selectedTimeSlotText: {
      color: Colors.whitetext,
    },
    unavailableText: {
      color: Colors.textAppColor || Colors.text,
    },
    serviceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SW(12),
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(8),
      marginBottom: SH(8),
    },
    serviceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    serviceDetails: {
      marginLeft: SW(12),
      flex: 1,
    },
    serviceName: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(2),
    },
    servicePrice: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    removeButton: {
      padding: SW(4),
    },
    addServiceButton: {
      paddingVertical: SH(8),
    },
    addServiceText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    summaryContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.white,
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SH(12),
    },
    summaryLabel: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    bookButton: {
      borderRadius: SF(12),
    },
  });
};

