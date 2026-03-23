import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DateData } from 'react-native-calendars';
import { Container, AppHeader, BookingCard, CustomText, LoadingComp } from '@components';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useGetCustomerBookings } from '@services/api/queries/appQueries';
import { formatAddress, getStatusColor } from '@utils/tools';
import imagePaths from '@assets';
import BookingListFilters, {
  BookingStatusOption,
} from '@components/booking/BookingListFilters';
import BookingListCalendarModal from '@components/booking/BookingListCalendarModal';

// Format date from API (YYYY-MM-DD) to display e.g. 06-March-2025
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
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
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

const formatBookingAddress = (booking: any): string => {
  const preferences = booking.preferences?.[0]?.toLowerCase()?.trim();
  let addressData: any = null;
  if (preferences === 'athome') {
    addressData = booking.addressId;
  }
  if (preferences !== 'athome') {
    addressData = booking.spBusinessProfile;
  }

  if (addressData) {
    return formatAddress({
      line1: addressData.line1,
      line2: addressData.line2,
      landmark: addressData.landmark,
      pincode: addressData.pincode,
      city: addressData.city?.name,
      country: addressData.country?.name,
    });
  }
  return '';
};

const bookingStatusOptions: BookingStatusOption[] = [
  { value: '', labelKey: 'myBookingScreen.filter.allBookings' },
  { value: 'requested', labelKey: 'myBookingScreen.filter.requested' },
  { value: 'accepted', labelKey: 'myBookingScreen.filter.accepted' },
  { value: 'ongoing', labelKey: 'myBookingScreen.filter.ongoing' },
  { value: 'completed', labelKey: 'myBookingScreen.filter.completed' },
  { value: 'cancelledByCustomer',labelKey: 'myBookingScreen.filter.cancelledByYou',},
  { value: 'cancelledBySp',labelKey: 'myBookingScreen.filter.cancelledByProvider',},
  { value: 'rejected', labelKey: 'myBookingScreen.filter.rejected' },
  { value: 'rescheduledByCustomer', label: 'Rescheduled by Customer' },
  { value: 'rescheduledBySp', label: 'Rescheduled by SP' },
];

const formatDateDisplay = (dateStr: string): string => {
  try {
    const date = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
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
  const [hasLoadedFirstPage, setHasLoadedFirstPage] = useState(false);

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
  const showInitialLoader = !hasLoadedFirstPage && (bookingsLoading || bookingsFetching);

  useEffect(() => {
    const nextPageBookings = bookingsData?.ResponseData ?? [];

    setAllBookings(prev => {
      if (page === 1) {
        return nextPageBookings;
      }

    
      const existingIds = new Set(prev.map((booking: any) => booking?._id));
      const nextById = new Map(nextPageBookings.map((b: any) => [b?._id, b]));

      const updatedExisting = prev.map((booking: any) => {
        const id = booking?._id;
        if (!id) return booking;
        const updated = nextById.get(id);
        return updated ? updated : booking;
      });

      const newBookings = nextPageBookings.filter((booking: any) => !existingIds.has(booking?._id));
      return [...updatedExisting, ...newBookings];
    });

    if (page === 1 && bookingsData) {
      setHasLoadedFirstPage(true);
    }
  }, [bookingsData, page]);

  const transformedBookings = useMemo(() => {
    return allBookings.map((booking: any) => {
      const bookingData = booking as any;
      return {
        id: booking._id,
        bookingId:
          bookingData?.bookingId ||
          booking._id?.slice(-8)?.toUpperCase() ||
          '—',
        friendName:
          booking.bookedFor === 'other'
            ? booking.bookedForDetails?.name
            : undefined,
        status: booking.bookingStatus || 'requested',
        statusColor: getStatusColor(booking.bookingStatus),
        date: formatDate(booking.date),
        time: booking.time || '',
        shopName: booking.spId?.name || t('bookingList.serviceProviderDefault'),
        address: formatBookingAddress(booking),
        price: `$${(
          booking.discountedAmount ??
          booking.totalAmount ??
          0
        ).toFixed(2)}`,
        image: booking?.spBusinessProfile?.bannerImage
          ? { uri: booking.spBusinessProfile.bannerImage }
          : imagePaths.no_image,
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
      await refetchBookings();
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBookings]);

  const handleEndReached = useCallback(() => {
    if (bookingsFetching || bookingsLoading || refreshing || !hasMorePages) {
      return;
    }

    setPage(prev => prev + 1);
  }, [bookingsFetching, bookingsLoading, refreshing, hasMorePages]);

  // Refetch list when screen gains focus (e.g. after checkout or returning from detail).
  // Do not clear allBookings here — keep showing existing data until new data arrives to avoid a flash of empty state.
  useFocusEffect(
    useCallback(() => {
      // Reset filters whenever user enters Booking List from other tabs/screens.
      setSelectedStatus('');
      setSelectedDate(null);
      setCalendarModalVisible(false);
      setPage(1);
      refetchBookings();
    }, [refetchBookings]),
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

  const renderBookingItem = useCallback(
    ({ item }: any) => (
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
    ),
    [handleBookAgain, handleCardPress],
  );

  const showEmptyState =
    hasLoadedFirstPage && !bookingsFetching && !showInitialLoader && currentBookings.length === 0;

  return (
    <Container
      safeArea={false}
      statusBarColor={theme.colors.white}
      style={styles.container}
    >
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('myBookingScreen.headerTitle')}
          backgroundColor={theme.colors.white}
          tintColor={theme.colors.text}
        />
      </View>

      <BookingListFilters
        selectedStatus={selectedStatus}
        selectedDate={selectedDate}
        onSelectStatus={handleFilterSelect}
        onOpenCalendar={openCalendarModal}
        onClearDate={handleClearDate}
        formatDateDisplay={formatDateDisplay}
        statusOptions={bookingStatusOptions}
      />

      {showInitialLoader ? (
        <View style={styles.loadingContainer}>
          <LoadingComp visible={true} />
        </View>
      ) : (
        <FlatList
          data={currentBookings}
          keyExtractor={item => item.id}
          renderItem={renderBookingItem}
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
            showEmptyState ? (
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
            ) : null
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

      <BookingListCalendarModal
        visible={calendarModalVisible}
        currentMonth={calendarViewingMonth}
        selectedDate={selectedDate}
        onClose={closeCalendarModal}
        onDateSelect={handleDateSelect as (day: DateData) => void}
      />
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
    listContent: {
      paddingTop: theme.SH(10),
      paddingBottom: theme.SH(90),
      paddingHorizontal: theme.SW(16),
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
  });
