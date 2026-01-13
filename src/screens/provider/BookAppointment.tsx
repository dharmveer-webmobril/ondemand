import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
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
];

const generateCalendarDays = () => {
  const days = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dayOfWeek = date.getDay();
    days.push({
      day: i,
      dayName: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      date: date,
    });
  }
  return days;
};

export default function BookAppointment() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState<number>(6);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState([
    { id: '1', name: 'Haircut + Beard', price: 55.00, duration: '30m' },
  ]);

  const calendarDays = useMemo(() => generateCalendarDays(), []);
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const duration = parseInt(service.duration.replace('m', ''));
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
          <CustomText style={styles.sectionTitle}>{monthName}</CustomText>
          <View style={styles.calendarContainer}>
            <View style={styles.dayNamesRow}>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                <View key={day} style={styles.dayNameCell}>
                  <CustomText style={styles.dayNameText}>{day}</CustomText>
                </View>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((day) => {
                const isSelected = day.day === selectedDate;
                const isWeekend = day.isWeekend;
                return (
                  <Pressable
                    key={day.day}
                    onPress={() => setSelectedDate(day.day)}
                    style={({ pressed }) => [
                      styles.calendarDay,
                      isSelected && styles.selectedDay,
                      isWeekend && styles.weekendDay,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isWeekend && !isSelected && styles.weekendText,
                      ]}
                    >
                      {day.day}
                    </CustomText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Select Time</CustomText>
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
                      isSelected && styles.selectedTimeSlotText,
                      !isAvailable && styles.unavailableText,
                    ]}
                  >
                    {item.time}
                  </CustomText>
                </Pressable>
              );
            }}
          />
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
    },
    dayNamesRow: {
      flexDirection: 'row',
      marginBottom: SH(8),
    },
    dayNameCell: {
      flex: 1,
      alignItems: 'center',
    },
    dayNameText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SF(8),
      marginBottom: SH(8),
    },
    selectedDay: {
      backgroundColor: Colors.primary,
    },
    weekendDay: {
      // Weekend styling
    },
    dayText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    selectedDayText: {
      color: Colors.whitetext,
      fontFamily: Fonts.SEMI_BOLD,
    },
    weekendText: {
      color: Colors.primary,
    },
    timeSlotsContainer: {
      gap: SW(12),
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

