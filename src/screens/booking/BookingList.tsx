import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { Container, AppHeader, BookingCard, CustomText, LoadingComp } from '@components';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useGetCustomerBookings } from '@services/api/queries/appQueries';
import { formatAddress, getStatusColor } from '@utils/tools';
import imagePaths from '@assets';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { VectoreIcons } from '@components/common';

// Format date from API (YYYY-MM-DD) to display e.g. 06-March-2025
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

// Format address from booking (t for i18n)
const formatBookingAddress = (booking: any,): string => {
  console.log('booking.addressId', booking);

  const preferences = booking.preferences[0]?.toLowerCase()?.trim();
  // const bookedFor = booking.bookedFor?.toLowerCase()?.trim();
  let addressData: any = null;
  if (preferences === 'athome') {
    addressData = booking.addressId;
  } 
  if (preferences !== 'athome') {
    addressData = booking.spBusinessProfile;
  }

  if (addressData) {
    return formatAddress({ line1: addressData.line1, line2: addressData.line2, landmark: addressData.landmark, pincode: addressData.pincode, city: addressData.city?.name, country: addressData.country?.name });
  }
  return '';
};

// Booking status filter options (labels use translation in render)
const bookingStatusOptions = [
  { value: '', labelKey: 'myBookingScreen.filter.allBookings' },
  { value: 'requested', labelKey: 'myBookingScreen.filter.requested' },
  { value: 'accepted', labelKey: 'myBookingScreen.filter.accepted' },
  { value: 'ongoing', labelKey: 'myBookingScreen.filter.ongoing' },
  { value: 'completed', labelKey: 'myBookingScreen.filter.completed' },
  { value: 'cancelledByCustomer', labelKey: 'myBookingScreen.filter.cancelledByYou' },
  { value: 'cancelledBySp', labelKey: 'myBookingScreen.filter.cancelledByProvider' },
  { value: 'rejected', labelKey: 'myBookingScreen.filter.rejected' },
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatDateDisplay = (dateStr: string): string => {
  try {
    const date = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const getFirstDayOfMonth = (dateStr: string): string => {
  const date = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const addMonths = (dateStr: string, delta: number): string => {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setMonth(date.getMonth() + delta);
  return getFirstDayOfMonth(date.toISOString().slice(0, 10));
};

const formatMonthYear = (dateStr: string): string => {
  const date = new Date(`${dateStr}T12:00:00`);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
};

export default function BookingList() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarViewingMonth, setCalendarViewingMonth] = useState<string>(() =>
    getFirstDayOfMonth(''),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch bookings from API
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isFetching: bookingsFetching,
    refetch: refetchBookings,
  } = useGetCustomerBookings(page, 10);

  const pagination = bookingsData?.pagination;
  const hasMorePages = (pagination?.page ?? 1) < (pagination?.pages ?? 1);
  const showInitialLoader = bookingsLoading && allBookings.length === 0 && !refreshing;

  useEffect(() => {
    const nextPageBookings = bookingsData?.ResponseData ?? [];

    setAllBookings((prev) => {
      if (page === 1) {
        return nextPageBookings;
      }

      const existingIds = new Set(prev.map((booking: any) => booking?._id));
      const uniqueBookings = nextPageBookings.filter(
        (booking: any) => !existingIds.has(booking?._id),
      );

      return [...prev, ...uniqueBookings];
    });
  }, [bookingsData, page]);

  useEffect(() => {
    if (!bookingsFetching) {
      setRefreshing(false);
    }
  }, [bookingsFetching]);

  // Transform API bookings to BookingItem format
  const transformedBookings = useMemo(() => {
    if (!allBookings.length) return [];
    return allBookings.map((booking: any): any => {
      const bookingData = booking as any;
      return {
        id: booking._id,
        bookingId: bookingData?.bookingId || booking._id?.slice(-8)?.toUpperCase() || '—',
        friendName: booking.bookedFor === 'other' ? booking.bookedForDetails?.name : undefined,
        status: booking.bookingStatus || 'requested',
        statusColor: getStatusColor(booking.bookingStatus),
        date: formatDate(booking.date),
        time: booking.time || '',
        shopName: booking.spId?.name || t('bookingList.serviceProviderDefault'),
        address: formatBookingAddress(booking),
        price: `$${(booking.discountedAmount ?? booking.totalAmount ?? 0).toFixed(2)}`,
        image: booking?.spBusinessProfile?.bannerImage ? { uri: booking.spBusinessProfile.bannerImage } : imagePaths.no_image,
        originalBooking: booking,
      };
    });
  }, [allBookings, t]);

  // Filter bookings based on selected status
  const currentBookings = useMemo(() => {
    return transformedBookings.filter((booking: any) => {
      const statusMatches =
        !selectedStatus ||
        booking.status?.toLowerCase() === selectedStatus.toLowerCase();
      const bookingDate = booking.originalBooking?.date?.slice(0, 10);
      const dateMatches = !selectedDate || bookingDate === selectedDate;

      return statusMatches && dateMatches;
    });
  }, [transformedBookings, selectedStatus, selectedDate]);

  const handleFilterSelect = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const openCalendarModal = useCallback(() => {
    setCalendarViewingMonth(
      getFirstDayOfMonth(selectedDate ?? new Date().toISOString().slice(0, 10)),
    );
    setCalendarModalVisible(true);
  }, [selectedDate]);

  const closeCalendarModal = useCallback(() => {
    setCalendarModalVisible(false);
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCalendarViewingMonth((prev) => addMonths(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarViewingMonth((prev) => addMonths(prev, 1));
  }, []);

  const handleDateSelect = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    setCalendarModalVisible(false);
  }, []);

  const handleClearDate = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setPage(1);
      if (page === 1) {
        await refetchBookings();
      }
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    }
  }, [page, refetchBookings]);

  const handleEndReached = useCallback(() => {
    if (bookingsFetching || bookingsLoading || refreshing || !hasMorePages) {
      return;
    }

    setPage((prev) => prev + 1);
  }, [bookingsFetching, bookingsLoading, refreshing, hasMorePages]);

  // Refetch list when screen gains focus (e.g. after checkout or returning from detail).
  // Do not clear allBookings here — keep showing existing data until new data arrives to avoid a flash of empty state.
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      refetchBookings();
    }, [refetchBookings])
  );

  const handleBookAgain = useCallback((bookingId: string) => {
    // TODO: Navigate to booking screen
    console.log('Book again for:', bookingId);
  }, []);

  const handleCardPress = useCallback((bookingId: string) => {
    // Navigate to booking detail with booking ID - API will fetch the details
    navigate(SCREEN_NAMES.BOOKING_DETAIL, {
      bookingId: bookingId,
    });
  }, []);

  return (
    <Container safeArea={false} statusBarColor={theme.colors.white} style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('myBookingScreen.headerTitle')}
          backgroundColor={theme.colors.white}
          tintColor={theme.colors.text}
        />
      </View>

      {selectedDate && (
        <View style={styles.dateFilterRow}>
          <CustomText style={styles.dateFilterLabel}>
            Date: {formatDateDisplay(selectedDate)}
          </CustomText>
          <Pressable onPress={handleClearDate} style={styles.clearDateButton}>
            <CustomText style={styles.clearDateText}>Clear</CustomText>
          </Pressable>
        </View>
      )}

      {/* Filter Menu */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <View style={styles.statusFilterWrap}>
            <Menu>
              <MenuTrigger>
                <View style={styles.filterButton}>
                  <CustomText style={styles.filterButtonText}>
                    {t(bookingStatusOptions?.find(option => option.value === selectedStatus)?.labelKey || 'myBookingScreen.filter.allBookings')}
                  </CustomText>
                  <CustomText style={styles.filterIcon}>▼</CustomText>
                </View>
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={styles.menuOptions}>
                {bookingStatusOptions.map((option) => {
                  const isSelected = selectedStatus === option.value;
                  return (
                    <MenuOption
                      key={option.value}
                      onSelect={() => handleFilterSelect(option.value)}
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
                        {t(option.labelKey)}
                      </CustomText>
                    </MenuOption>
                  );
                })}
              </MenuOptions>
            </Menu>
          </View>

          <TouchableOpacity style={styles.calendarButton} onPress={openCalendarModal}>
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

      {showInitialLoader ? (
        <View style={styles.loadingContainer}>
          <LoadingComp visible={true} />
        </View>
      ) : (
        <FlatList
          data={currentBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard
              bookingId={item.bookingId}
              friendName={item.friendName}
              status={item.status}
              statusColor={item.statusColor}
              date={item.date}
              time={item.time}
              shopName={item.shopName}
              address={item.address}
              price={item.price}
              image={item.image}
              onBookAgain={
                item.status?.toLowerCase() === 'completed'
                  ? () => handleBookAgain(item.bookingId || item.id)
                  : undefined
              }
              onPress={() => handleCardPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary || '#135D96']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.gray || '#666666'}
                textAlign="center"
              >
                {t('myBookingScreen.messages.noBookings')}
              </CustomText>
            </View>
          }
          ListFooterComponent={
            bookingsFetching && page > 1 ? (
              <View style={styles.paginationLoader}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      <Modal
        visible={calendarModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeCalendarModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeCalendarModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>Select Date</CustomText>
              <TouchableOpacity
                onPress={closeCalendarModal}
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

            <View style={styles.calendarNavRow}>
              <TouchableOpacity
                onPress={goToPrevMonth}
                style={styles.calendarNavButton}
                hitSlop={8}
              >
                <VectoreIcons
                  name="chevron-back"
                  size={22}
                  icon="Ionicons"
                  color={theme.colors.primary}
                />
                <CustomText style={styles.calendarNavText}>Prev</CustomText>
              </TouchableOpacity>

              <CustomText style={styles.calendarMonthLabel} numberOfLines={1}>
                {formatMonthYear(calendarViewingMonth)}
              </CustomText>

              <TouchableOpacity
                onPress={goToNextMonth}
                style={styles.calendarNavButton}
                hitSlop={8}
              >
                <CustomText style={styles.calendarNavText}>Next</CustomText>
                <VectoreIcons
                  name="chevron-forward"
                  size={22}
                  icon="Ionicons"
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            <Calendar
              key={calendarViewingMonth}
              current={calendarViewingMonth}
              onDayPress={handleDateSelect}
              markedDates={
                selectedDate
                  ? { [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }
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
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    headerContainer: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(16),
    },
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
      backgroundColor: theme.colors.primary_light || theme.colors.secondary || '#E3F2FD',
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
    listContent: {
      paddingTop: theme.SH(10),
      paddingBottom: theme.SH(90),
      paddingHorizontal: theme.SW(16),
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.SH(100),
      paddingHorizontal: theme.SW(20),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationLoader: {
      paddingVertical: theme.SH(20),
    },
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
    calendarNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(12),
    },
    calendarNavButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(4),
    },
    calendarNavText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.primary,
    },
    calendarMonthLabel: {
      flex: 1,
      textAlign: 'center',
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginHorizontal: theme.SW(8),
    },
    calendar: {
      paddingBottom: theme.SH(16),
    },
  });