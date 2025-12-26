import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Container, AppHeader, BookingCard, CustomText } from '@components';
import CustomBookingTabs from '@components/booking/CustomBookingTabs';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

// Static data - will be replaced with API data later
const MY_BOOKINGS_DATA: BookingItem[] = [
  {
    id: '1',
    bookingId: 'BK001',
    status: 'COMPLETED' as const,
    date: '06-March-2025',
    time: '8:00 am - 8:30 am',
    shopName: 'WM Barbershop',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    price: '$555.00',
    image: imagePaths.barber1,
  },
  {
    id: '2',
    bookingId: 'BK002',
    status: 'UPCOMING' as const,
    date: '06-March-2025',
    time: '8:00 am - 8:30 am',
    shopName: 'WM Barbershop',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    price: '$555.00',
    image: imagePaths.barber2,
  },
  {
    id: '3',
    bookingId: 'BK003',
    status: 'ONGOING' as const,
    date: '06-March-2025',
    time: '8:00 am - 8:30 am',
    shopName: 'WM Barbershop',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    price: '$555.00',
    image: imagePaths.barber3,
  },
  {
    id: '4',
    bookingId: 'BK004',
    status: 'ONGOING' as const,
    date: '06-March-2025',
    time: '8:00 am - 8:30 am',
    shopName: 'WM Barbershop',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    price: '$555.00',
    image: imagePaths.barber4,
  },
];

const OTHER_BOOKINGS_DATA: BookingItem[] = [
  {
    id: '1',
    friendName: 'Friend Name',
    status: 'COMPLETED' as const,
    date: '12-april-2025',
    time: '6:00 am - 6:30 am',
    shopName: 'WM Barbershop',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    price: '$200.00',
    image: imagePaths.barber1,
  },
  {
    id: '2',
    friendName: 'Friend Name',
    status: 'ONGOING' as const,
    date: '12-april-2025',
    time: '6:00 am - 6:30 am',
    shopName: 'WM Barbershop',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    price: '$200.00',
    image: imagePaths.barber2,
  },
];

export default function BookingList() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const currentBookings = selectedTabIndex === 0 ? MY_BOOKINGS_DATA : OTHER_BOOKINGS_DATA;

  const handleTabPress = useCallback((index: number) => {
    setSelectedTabIndex(index);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Add API call here when ready
    // await refetchBookings();
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    setRefreshing(false);
  }, []);

  const handleBookAgain = useCallback((bookingId: string) => {
    // TODO: Navigate to booking screen
    console.log('Book again for:', bookingId);
  }, []);

  const handleCardPress = useCallback((bookingId: string) => {
    // TODO: Navigate to booking details
    console.log('View booking:', bookingId);
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

      <FlatList
        data={currentBookings}
        keyExtractor={(item) => item.id}
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
      paddingBottom: theme.SH(20),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.SH(100),
      paddingHorizontal: theme.SW(20),
    },
  });