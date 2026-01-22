import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Container, AppHeader, BookingCard, CustomText, LoadingComp } from '@components';
import CustomBookingTabs from '@components/booking/CustomBookingTabs';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useGetCustomerBookings, Booking } from '@services/api/queries/appQueries';
import imagePaths from '@assets';

type BookingStatus = 'COMPLETED' | 'ONGOING' | 'UPCOMING';

type BookingItem = {
  id: string;
  bookingId?: string;
  friendName?: string;
  status: BookingStatus;
  date: string;
  time: string;
  shopName: string;
  address: string;
  price: string;
  image: any;
};

// Map API booking status to UI status
const mapBookingStatus = (bookingStatus: string): BookingStatus => {
  const statusMap: Record<string, BookingStatus> = {
    'completed': 'COMPLETED',
    'ongoing': 'ONGOING',
    'accepted': 'ONGOING',
    'requested': 'UPCOMING',
    'pending': 'UPCOMING',
  };
  return statusMap[bookingStatus?.toLowerCase()] || 'UPCOMING';
};

// Format date from API format (YYYY-MM-DD) to display format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

// Format address from booking
const formatBookingAddress = (booking: Booking): string => {
  if (booking.addressId) {
    const addr = booking.addressId;
    const parts = [addr.line1];
    if (addr.line2) parts.push(addr.line2);
    if (addr.landmark) parts.push(addr.landmark);
    return parts.join(', ');
  }
  return 'Address not available';
};

export default function BookingList() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [page] = useState(1);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch bookings from API
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useGetCustomerBookings(page, 10);

  const tabs = [
    {
      id: 1,
      name: t('myBookingScreen.tabs.myBookings'),
      type: 'My Booking',
    },
    {
      id: 2,
      name: t('myBookingScreen.tabs.otherBookings'),
      type: 'Other Booking',
    },
  ];

  // Transform API bookings to BookingItem format
  const transformedBookings = useMemo(() => {
    if (!bookingsData?.ResponseData) return [];

    return bookingsData.ResponseData.map((booking: Booking): BookingItem => {
      const imageSource = booking.spId?.profileImage 
        ? { uri: booking.spId.profileImage }
        : imagePaths.no_image;

      return {
        id: booking._id,
        bookingId: booking._id,
        friendName: booking.bookedFor === 'other' ? booking.bookedForDetails?.name : undefined,
        status: mapBookingStatus(booking.bookingStatus),
        date: formatDate(booking.date),
        time: booking.time || '',
        shopName: booking.spId?.name || 'Service Provider',
        address: formatBookingAddress(booking),
        price: `$${booking.discountedAmount?.toFixed(2) || booking.totalAmount?.toFixed(2) || '0.00'}`,
        image: imageSource,
      };
    });
  }, [bookingsData]);

  // Filter bookings based on selected tab
  const currentBookings = useMemo(() => {
    if (selectedTabIndex === 0) {
      // My Bookings - show bookings where bookedFor === 'self'
      return transformedBookings.filter((booking) => {
        const originalBooking = bookingsData?.ResponseData?.find((b: Booking) => b._id === booking.id);
        return originalBooking?.bookedFor === 'self';
      });
    } else {
      // Other Bookings - show bookings where bookedFor === 'other'
      return transformedBookings.filter((booking) => {
        const originalBooking = bookingsData?.ResponseData?.find((b: Booking) => b._id === booking.id);
        return originalBooking?.bookedFor === 'other';
      });
    }
  }, [transformedBookings, selectedTabIndex, bookingsData]);

  const handleTabPress = useCallback((index: number) => {
    setSelectedTabIndex(index);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchBookings();
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBookings]);

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

      <View style={styles.tabsContainer}>
        <CustomBookingTabs
          tabs={tabs}
          selectedIndex={selectedTabIndex}
          onTabPress={handleTabPress}
        />
      </View>

      {bookingsLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingComp visible={true} />
        </View>
      ) : (
        <FlatList
          data={currentBookings}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <BookingCard
              bookingId={item.bookingId}
              friendName={item.friendName}
              status={item.status}
              date={item.date}
              time={item.time}
              shopName={item.shopName}
              address={item.address}
              price={item.price}
              image={item.image}
              onBookAgain={
                item.status === 'COMPLETED'
                  ? () => handleBookAgain(item.bookingId || item.friendName || item.id)
                  : undefined
              }
              onPress={() => handleCardPress(item.bookingId || item.friendName || item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
        />
      )}
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
    tabsContainer: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(10),
    },
    listContent: {
      paddingTop: theme.SH(10),
      paddingBottom: theme.SH(90),
      paddingHorizontal: theme.SW(8),
    },
    row: {
      justifyContent: 'space-between',
      paddingHorizontal: theme.SW(8),
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
  });