import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Container, AppHeader, BookingCard, CustomText, LoadingComp } from '@components';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useGetCustomerBookings, Booking } from '@services/api/queries/appQueries';
import { getStatusColor, getStatusLabel } from '@utils/tools';
import imagePaths from '@assets';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

// Format date from API format (YYYY-MM-DD) to display format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

// Booking status filter options
const bookingStatusOptions = [
  { value: '', label: 'All Bookings' },
  { value: 'requested', label: 'Requested' },
  { value: 'accepted', label: 'Accepted' },
  // { value: 'ontheway', label: 'On The Way' },
  // { value: 'reached', label: 'Reached' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelledByCustomer', label: 'Cancelled by You' },
  { value: 'cancelledBySp', label: 'Cancelled by Provider' },
  { value: 'rejected', label: 'Rejected' },
];

export default function BookingList() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [page] = useState(1);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch bookings from API
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useGetCustomerBookings(page, 10);

  // Transform API bookings to BookingItem format
  const transformedBookings = useMemo(() => {
    if (!bookingsData?.ResponseData) return [];

    return bookingsData.ResponseData.map((booking: Booking): any => {
      const imageSource = booking.spId?.profileImage
        ? { uri: booking.spId.profileImage }
        : imagePaths.no_image;

      const bookingData = booking as any;
      return {
        id: booking._id,
        bookingId: bookingData?.bookingId || booking._id,
        friendName: booking.bookedFor === 'other' ? booking.bookedForDetails?.name : undefined,
        status: booking.bookingStatus || 'requested', // Use original status
        statusColor: getStatusColor(booking.bookingStatus),
        date: formatDate(booking.date),
        time: booking.time || '',
        shopName: booking.spId?.name || 'Service Provider',
        address: formatBookingAddress(booking),
        price: `$${booking.discountedAmount?.toFixed(2) || booking.totalAmount?.toFixed(2) || '0.00'}`,
        image: imageSource,
        originalBooking: booking, // Store original booking for filtering
      };
    });
  }, [bookingsData]);

  // Filter bookings based on selected status
  const currentBookings = useMemo(() => {
    if (!selectedStatus) {
      return transformedBookings;
    }
    return transformedBookings.filter((booking: any) => {
      return booking.status?.toLowerCase() === selectedStatus.toLowerCase();
    });
  }, [transformedBookings, selectedStatus]);

  const handleFilterSelect = useCallback((status: string) => {
    setSelectedStatus(status);
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

      {/* Filter Menu */}
      <View style={styles.filterContainer}>
        <Menu>
          <MenuTrigger>
            <View style={styles.filterButton}>
              <CustomText style={styles.filterButtonText}>
                {bookingStatusOptions?.find(option => option.value === selectedStatus)?.label || 'All Bookings'}
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
                    {option.label}
                  </CustomText>
                </MenuOption>
              );
            })}
          </MenuOptions>
        </Menu>
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
              bookingId={item.bookingId || item.id}
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
                item.status === 'completed'
                  ? () => handleBookAgain(item.bookingId || item.friendName || item.id)
                  : undefined
              }
              onPress={() => handleCardPress(item.id)}
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
    filterContainer: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(10),
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