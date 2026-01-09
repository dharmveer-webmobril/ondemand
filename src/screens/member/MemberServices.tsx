import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Container, AppHeader, CustomText, ImageLoader, VectoreIcons } from '@components';
import CustomBookingTabs from '@components/booking/CustomBookingTabs';
import { useThemeContext } from '@utils/theme';
import imagePaths from '@assets';

type ServiceStatus = 'Upcoming' | 'Pending' | 'Completed';

type Service = {
  id: string;
  customerName: string;
  service: string;
  location: string;
  date: string;
  time: string;
  price: string;
  status: ServiceStatus;
  customerImage?: any;
};

export default function MemberServices() {
  const theme = useThemeContext();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const tabs = [
    { id: 1, name: 'Today', type: 'today' },
    { id: 2, name: 'Upcoming', type: 'upcoming' },
    { id: 3, name: 'Completed', type: 'completed' },
    { id: 4, name: 'Pending', type: 'pending' },
  ];

  // Mock data - replace with actual API data
  const allServices: Service[] = [
    {
      id: '1',
      customerName: 'Rajesh Kumar',
      service: 'Plumbing Repair',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$ 80',
      status: 'Upcoming',
      customerImage: imagePaths.barber1,
    },
    {
      id: '2',
      customerName: 'Rajesh Kumar',
      service: 'AC Maintenance',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$ 60',
      status: 'Completed',
      customerImage: imagePaths.barber1,
    },
    {
      id: '3',
      customerName: 'Ashutosh Pandey',
      service: 'Plumbing Repair',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$ 120',
      status: 'Pending',
      customerImage: imagePaths.barber1,
    },
    {
      id: '4',
      customerName: 'Rajesh Kumar',
      service: 'AC Maintenance',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$ 75',
      status: 'Upcoming',
      customerImage: imagePaths.barber1,
    },
    {
      id: '5',
      customerName: 'Ashutosh Pandey',
      service: 'Plumbing Repair',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$ 40',
      status: 'Upcoming',
      customerImage: imagePaths.barber1,
    },
    {
      id: '6',
      customerName: 'Ashutosh Pandey',
      service: 'Plumbing Repair',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$ 120',
      status: 'Pending',
      customerImage: imagePaths.barber1,
    },
  ];

  const filterServicesByTab = (services: Service[], tabIndex: number): Service[] => {
    switch (tabIndex) {
      case 0: // Today
        // Filter services for today - in real app, compare dates
        return services.filter((s) => s.status === 'Upcoming' || s.status === 'Pending');
      case 1: // Upcoming
        return services.filter((s) => s.status === 'Upcoming');
      case 2: // Completed
        return services.filter((s) => s.status === 'Completed');
      case 3: // Pending
        return services.filter((s) => s.status === 'Pending');
      default:
        return services;
    }
  };

  const filteredServices = useMemo(
    () => filterServicesByTab(allServices, selectedTabIndex),
    [selectedTabIndex]
  );

  const handleTabPress = useCallback((index: number) => {
    setSelectedTabIndex(index);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Add API call here when ready
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    setRefreshing(false);
  }, []);

  const handleServicePress = useCallback((serviceId: string) => {
    // TODO: Navigate to service details
    console.log('View service:', serviceId);
  }, []);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50';
      case 'Pending':
        return '#FAAC00';
      case 'Upcoming':
        return '#009BFF';
      default:
        return theme.colors.text;
    }
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <Pressable
      style={styles.serviceCard}
      onPress={() => handleServicePress(item.id)}
      android_ripple={{ color: theme.colors.gray || '#F5F5F5' }}
    >
      <ImageLoader
        source={item.customerImage}
        mainImageStyle={styles.customerImage}
        resizeMode="cover"
        fallbackImage={imagePaths.barber1}
      />
      <View style={styles.serviceContent}>
        <CustomText
          variant="h4"
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
          style={styles.customerName}
        >
          {item.customerName}
        </CustomText>
        <CustomText
          variant="h5"
          fontFamily={theme.fonts.MEDIUM}
          color={theme.colors.text}
          style={styles.serviceType}
        >
          {item.service}
        </CustomText>
        <View style={styles.detailRow}>
          <VectoreIcons
            icon="Ionicons"
            name="location-outline"
            size={theme.SF(14)}
            color={theme.colors.lightText}
          />
          <CustomText
            variant="h6"
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText}
            style={styles.detailText}
            numberOfLines={1}
          >
            {item.location}
          </CustomText>
        </View>
        <View style={styles.detailRow}>
          <VectoreIcons
            icon="MaterialIcons"
            name="calendar-today"
            size={theme.SF(14)}
            color={theme.colors.lightText}
          />
          <CustomText
            variant="h6"
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText}
            style={styles.detailText}
          >
            {item.date} {item.time}
          </CustomText>
        </View>
      </View>
      <View style={styles.rightSection}>
        <CustomText
          variant="h3"
          fontFamily={theme.fonts.BOLD}
          color={theme.colors.text}
          style={styles.price}
        >
          {item.price}
        </CustomText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <CustomText
            fontSize={theme.fontSize.xxs}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.white}
          >
            {item.status}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Container style={styles.container}>
      <AppHeader
        title="All Service"
        onLeftPress={() => {
          // TODO: Navigate back
          console.log('Navigate back');
        }}
        leftIconName="angle-left"
        leftIconFamily="FontAwesome"
      />
      <View style={styles.content}>
        <View style={styles.tabsContainer}>
          <CustomBookingTabs
            tabs={tabs}
            selectedIndex={selectedTabIndex}
            onTabPress={handleTabPress}
          />
        </View>
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.SW(16),
    },
    tabsContainer: {
      paddingTop: theme.SH(16),
      paddingBottom: theme.SH(12),
    },
    listContent: {
      paddingBottom: theme.SH(20),
    },
    serviceCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E5E5E5',
    },
    customerImage: {
      width: theme.SW(60),
      height: theme.SW(60),
      borderRadius: theme.SW(30),
      marginRight: theme.SW(12),
    },
    serviceContent: {
      flex: 1,
      marginRight: theme.SW(12),
    },
    customerName: {
      marginBottom: theme.SH(4),
    },
    serviceType: {
      marginBottom: theme.SH(8),
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(4),
    },
    detailText: {
      marginLeft: theme.SW(6),
      flex: 1,
    },
    rightSection: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    price: {
      marginBottom: theme.SH(8),
    },
    statusBadge: {
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderRadius: theme.borderRadius.sm,
      minWidth: theme.SW(70),
      alignItems: 'center',
    },
  });

