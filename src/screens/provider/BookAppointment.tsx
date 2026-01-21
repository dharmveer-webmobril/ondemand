import { View, StyleSheet, ScrollView, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { Container, AppHeader, CustomText, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useGetServiceProviderAvailability, useGetServiceProviderServices } from '@services/index';
import { generateTimeSlots } from '@utils/timeSlotUtils';
import ServiceSelectionModal from '@components/provider/ServiceSelectionModal';
import AddOnSelectionModal from '@components/provider/AddOnSelectionModal';
import ServiceCart from '@components/provider/ServiceCart';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';

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
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bookingDetails, providerId, selectedServices } = route?.params;
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    refetch: refetchServices
  } = useGetServiceProviderServices(providerId, bookingDetails.deliveryMode);

  const services = servicesData?.ResponseData?.services || [];
  console.log('route--------route', route);
  console.log('services--------services', services);
  console.log('services--------services', isLoadingServices);
  console.log('services--------services', refetchServices);


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
  const [currentSelectedServices, setCurrentSelectedServices] = useState<any[]>(selectedServices || []);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [selectedServiceForAddOns, setSelectedServiceForAddOns] = useState<any>(null);
  // Fetch availability for selected date
  const {
    data: availabilityData,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
    isFetching: isFetchingAvailability,
  } = useGetServiceProviderAvailability(providerId, selectedDateString);

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
    let price = currentSelectedServices.reduce((sum: number, service: any) => {
      let servicePrice = service.price || 0;
      // Add add-ons price
      if (service.selectedAddOns && service.selectedAddOns.length > 0) {
        service.selectedAddOns.forEach((addOn: any) => {
          servicePrice += addOn.price || 0;
        });
      }
      return sum + servicePrice;
    }, 0);
    return price;
  }, [currentSelectedServices]);

  const totalDuration = useMemo(() => {
    let duration = currentSelectedServices.reduce((sum: number, service: any) => {
      let serviceDuration = service.time || 0;
      // Add add-ons duration
      if (service.selectedAddOns && service.selectedAddOns.length > 0) {
        service.selectedAddOns.forEach((addOn: any) => {
          serviceDuration += addOn.duration || 0;
        });
      }
      return sum + serviceDuration;
    }, 0);
    return duration;
  }, [currentSelectedServices]);

  const handleRemoveService = (serviceId: string) => {
    if (currentSelectedServices.length > 1) {
      setCurrentSelectedServices((prev) => prev.filter((s) => s._id !== serviceId));
    }
  };

  const handleAddService = () => {
    setShowServiceModal(true);
  };

  const handleServiceSelection = (selectedServiceIds: string[]) => {
    // Ensure at least one service is selected
    if (selectedServiceIds.length === 0) {
      return;
    }

    // Map selected IDs to full service objects with their current state
    const updatedServices = selectedServiceIds.map((serviceId: string) => {
      // Find if this service is already in currentSelectedServices
      const existingService = currentSelectedServices.find((s: any) => s._id === serviceId);

      if (existingService) {
        // Keep existing service with its add-ons
        return existingService;
      } else {
        // Find the service from all available services
        const service = services.find((s: any) => s._id === serviceId);
        if (service) {
          return { ...service, selectedAddOns: [] };
        }
        return null;
      }
    }).filter((s: any) => s !== null); // Remove any null entries

    setCurrentSelectedServices(updatedServices);
    setShowServiceModal(false);
  };

  const handleAddAddOns = (service: any) => {
    setSelectedServiceForAddOns(service);
    setShowAddOnModal(true);
  };

  const handleAddOnSelection = (selectedAddOnIds: string[]) => {
    if (!selectedServiceForAddOns) return;

    const addOns = selectedServiceForAddOns.serviceAddOns?.filter((addOn: any) =>
      selectedAddOnIds.includes(addOn._id)
    ) || [];

    setCurrentSelectedServices((prev) =>
      prev.map((service) =>
        service._id === selectedServiceForAddOns._id
          ? { ...service, selectedAddOns: addOns }
          : service
      )
    );
    setShowAddOnModal(false);
    setSelectedServiceForAddOns(null);
  };

  const handleBook = () => {
    if (!selectedTimeSlot) {
      return;
    }

    // Prepare booking JSON with all selected details
    const bookingJson = {
      providerId: providerId,
      selectedServices: currentSelectedServices,
      date: selectedDateString,
      timeSlot: selectedTimeSlot,
      // services: selectedServices,
      deliveryMode: bookingDetails.deliveryMode,
      totalPrice: totalPrice,
      totalDuration: `${totalDuration}m`,
    };

    console.log('Booking JSON:', JSON.stringify(bookingJson, null, 2));

    // Navigate to Checkout page
    navigation.navigate(SCREEN_NAMES.BOOKING_SUMMARY, {
      bookingData: bookingJson,
    });
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title="Book an Appointment"
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ marginHorizontal: theme.SW(20) }}
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
        <ServiceCart
          services={currentSelectedServices}
          onRemoveService={handleRemoveService}
          onAddAddOns={handleAddAddOns}
          onAddService={handleAddService}
        />
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
          disable={!selectedTimeSlot || currentSelectedServices.length === 0}
        />
      </View>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        visible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onConfirm={handleServiceSelection}
        services={services}
        selectedServiceIds={currentSelectedServices.map((s: any) => s._id)}
      />

      {/* Add-on Selection Modal */}
      {selectedServiceForAddOns && (
        <AddOnSelectionModal
          visible={showAddOnModal}
          onClose={() => {
            setShowAddOnModal(false);
            setSelectedServiceForAddOns(null);
          }}
          onConfirm={handleAddOnSelection}
          addOns={selectedServiceForAddOns.serviceAddOns || []}
          selectedAddOnIds={selectedServiceForAddOns.selectedAddOns?.map((a: any) => a._id) || []}
        />
      )}
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

