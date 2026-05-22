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
import { useQueryClient } from '@tanstack/react-query';
import {
  Container,
  AppHeader,
  BookingCard,
  CustomText,
  LoadingComp,
  showToast,
} from '@components';
import { useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  useGetCustomerBookings,
  useGetRoutineBookings,
} from '@services/api/queries/appQueries';
import axiosInstance from '@services/api/axiosInstance';
import EndPoints from '@services/api/EndPoints';
import { getStatusColor, getProviderDisplayName } from '@utils/tools';
import imagePaths from '@assets';
import BookingListFilters, {
  BookingStatusOption,
} from '@components/booking/BookingListFilters';
import BookingListCalendarModal from '@components/booking/BookingListCalendarModal';
import BookingListScopeTabs, {
  type BookingListScope,
} from '@components/booking/BookingListScopeTabs';
import RoutineStatusFilterBar from '@components/booking/RoutineStatusFilterBar';
import RoutineBookingCard from '@components/booking/RoutineBookingCard';
import { bookingHasPendingCustomerReviews } from '@utils/bookingReviewHelpers';
import {
  routineStatusMatchesFilter,
  type RoutineStatusFilter,
} from '@utils/routineBookingHelpers';
import { formatTime } from './BookingDetail';

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

const bookingStatusOptions: BookingStatusOption[] = [
  { value: '', labelKey: 'myBookingScreen.filter.allBookings' },
  { value: 'requested', labelKey: 'myBookingScreen.filter.requested' },
  { value: 'accepted', labelKey: 'myBookingScreen.filter.accepted' },
  { value: 'ongoing', labelKey: 'myBookingScreen.filter.ongoing' },
  { value: 'completed', labelKey: 'myBookingScreen.filter.completed' },
  {
    value: 'cancelledByCustomer',
    labelKey: 'myBookingScreen.filter.cancelledByYou',
  },
  {
    value: 'cancelledBySp',
    labelKey: 'myBookingScreen.filter.cancelledByProvider',
  },
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
  const queryClient = useQueryClient();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [bookingScope, setBookingScope] = useState<BookingListScope>('general');

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [routineStatusFilter, setRoutineStatusFilter] =
    useState<RoutineStatusFilter>('');

  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarViewingMonth, setCalendarViewingMonth] = useState<string>(() =>
    getFirstDayOfMonth(''),
  );
  const [refreshing, setRefreshing] = useState(false);

  const [generalPage, setGeneralPage] = useState(1);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [generalLoaded, setGeneralLoaded] = useState(false);

  const [routinePage, setRoutinePage] = useState(1);
  const [allRoutineBookings, setAllRoutineBookings] = useState<any[]>([]);
  const [routineLoaded, setRoutineLoaded] = useState(false);

  const [bookAgainLoadingId, setBookAgainLoadingId] = useState<string | null>(null);

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isFetching: bookingsFetching,
    refetch: refetchBookings,
  } = useGetCustomerBookings(generalPage, 10, 'general');

  const {
    data: routineData,
    isLoading: routineLoading,
    isFetching: routineFetching,
    refetch: refetchRoutine,
  } = useGetRoutineBookings(routinePage, 50);

  const generalPagination = bookingsData?.pagination;
  const generalHasMore =
    (generalPagination?.page ?? 1) < (generalPagination?.pages ?? 1);

  const routinePagination = routineData?.pagination;
  const routineHasMore =
    (routinePagination?.page ?? 1) <
    (routinePagination?.totalPages ?? routinePagination?.pages ?? 1);

  useEffect(() => {
    const next = bookingsData?.ResponseData ?? [];
    setAllBookings(prev => {
      if (generalPage === 1) return next;
      const existingIds = new Set(prev.map((b: any) => b?._id));
      const nextById = new Map(next.map((b: any) => [b?._id, b]));
      const updated = prev.map((b: any) => {
        const id = b?._id;
        return id && nextById.has(id) ? nextById.get(id) : b;
      });
      const added = next.filter((b: any) => !existingIds.has(b?._id));
      return [...updated, ...added];
    });
    if (generalPage === 1 && bookingsData) setGeneralLoaded(true);
  }, [bookingsData, generalPage]);

  useEffect(() => {
    const next = routineData?.ResponseData ?? [];
    setAllRoutineBookings(prev => {
      if (routinePage === 1) return next;
      const existingIds = new Set(prev.map((b: any) => b?._id));
      const added = next.filter((b: any) => !existingIds.has(b?._id));
      return [...prev, ...added];
    });
    if (routinePage === 1 && routineData) setRoutineLoaded(true);
  }, [routineData, routinePage]);

  const transformedGeneral = useMemo(
    () =>
      allBookings.map((booking: any) => ({
        id: booking._id,
        bookingId:
          booking?.bookingId || booking._id?.slice(-8)?.toUpperCase() || '—',
        friendName:
          booking.bookedFor === 'other'
            ? booking.bookedForDetails?.name
            : undefined,
        status: booking.bookingStatus || 'requested',
        statusColor: getStatusColor(booking.bookingStatus),
        date: formatDate(booking.date),
        time: booking.time || '',
        createdAt: booking.createdAt || '',
        createdAtDate: formatDate(booking.createdAt || ''),
        createdAtTime: formatTime(booking.createdAt || ''),
        shopName: getProviderDisplayName(
          {
            name:
              typeof booking.spId === 'object' ? booking.spId?.name : undefined,
            spBusinessProfile: booking.spBusinessProfile,
          },
          t('bookingList.serviceProviderDefault'),
        ),
        address: booking?.addressId?.formattedAddress || '',
        price: `$${(
          booking.discountedAmount ??
          booking.totalAmount ??
          0
        ).toFixed(2)}`,
        image: booking?.spBusinessProfile?.bannerImage
          ? { uri: booking.spBusinessProfile.bannerImage }
          : imagePaths.no_image,
        originalBooking: booking,
      })),
    [allBookings, t],
  );

  const filteredGeneral = useMemo(() => {
    return transformedGeneral.filter((booking: any) => {
      const statusMatches =
        !selectedStatus ||
        booking.status?.toLowerCase() === selectedStatus.toLowerCase();
      const bookingDate = booking.originalBooking?.date?.slice(0, 10);
      const dateMatches = !selectedDate || bookingDate === selectedDate;
      return statusMatches && dateMatches;
    });
  }, [transformedGeneral, selectedStatus, selectedDate]);

  const filteredRoutine = useMemo(() => {
    return allRoutineBookings.filter((item: any) =>
      routineStatusMatchesFilter(item.routineStatus, routineStatusFilter),
    );
  }, [allRoutineBookings, routineStatusFilter]);

  const handleScopeChange = useCallback((scope: BookingListScope) => {
    setBookingScope(scope);
    setSelectedStatus('');
    setSelectedDate(null);
    setRoutineStatusFilter('');
    setGeneralPage(1);
    setRoutinePage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (bookingScope === 'general') {
        setGeneralPage(1);
        await refetchBookings();
      } else {
        setRoutinePage(1);
        await refetchRoutine();
      }
    } finally {
      setRefreshing(false);
    }
  }, [bookingScope, refetchBookings, refetchRoutine]);

  const handleEndReached = useCallback(() => {
    if (bookingScope === 'general') {
      if (bookingsFetching || bookingsLoading || refreshing || !generalHasMore) {
        return;
      }
      setGeneralPage(p => p + 1);
      return;
    }
    if (routineFetching || routineLoading || refreshing || !routineHasMore) {
      return;
    }
    setRoutinePage(p => p + 1);
  }, [
    bookingScope,
    bookingsFetching,
    bookingsLoading,
    routineFetching,
    routineLoading,
    refreshing,
    generalHasMore,
    routineHasMore,
  ]);

  useFocusEffect(
    useCallback(() => {
      setSelectedStatus('');
      setSelectedDate(null);
      setRoutineStatusFilter('');
      setCalendarModalVisible(false);
      setGeneralPage(1);
      setRoutinePage(1);
      if (bookingScope === 'general') {
        refetchBookings();
      } else {
        refetchRoutine();
      }
    }, [bookingScope, refetchBookings, refetchRoutine]),
  );

  const fetchBookingDetail = useCallback(
    async (bookingDbId: string) => {
      return queryClient.fetchQuery({
        queryKey: ['bookingDetail', bookingDbId],
        queryFn: async () => {
          const response = await axiosInstance.get<any>(
            `${EndPoints.GET_BOOKING_DETAIL}/${bookingDbId}`,
          );
          return response.data;
        },
        staleTime: 30_000,
      });
    },
    [queryClient],
  );

  const handleBookAgain = useCallback(
    async (bookingDbId: string) => {
      if (!bookingDbId || bookAgainLoadingId) return;
      try {
        setBookAgainLoadingId(bookingDbId);
        const detail = await fetchBookingDetail(bookingDbId);
        const apiBooking = detail?.ResponseData?.booking;
        const bookedServices: any[] = (
          detail?.ResponseData?.bookedServices || []
        ).filter((s: any) => s && s.serviceId);

        const providerId =
          apiBooking?.spId?._id ||
          (typeof apiBooking?.spId === 'string' ? apiBooking?.spId : null);

        if (!providerId || !bookedServices.length) {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message: t('messages.somethingWentWrong'),
          });
          return;
        }

        const preferences: string[] = Array.isArray(apiBooking?.preferences)
          ? apiBooking.preferences
          : [];
        const deliveryMode = preferences[0] || 'atShop';

        const selectedServices = bookedServices.map((bs: any) => ({
          ...(bs?.serviceId || {}),
          selectedAddOns: Array.isArray(bs?.addOnServices)
            ? bs.addOnServices.filter(Boolean)
            : [],
        }));

        navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
          providerId,
          serviceId: selectedServices[0]?._id,
          selectedServices,
          bookingDetails: { deliveryMode },
          providerData: {
            ...(apiBooking?.spId || {}),
            businessProfile: apiBooking?.spBusinessProfile,
          },
        });
      } catch (error: any) {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message:
            error?.response?.data?.ResponseMessage ||
            t('messages.somethingWentWrong'),
        });
      } finally {
        setBookAgainLoadingId(null);
      }
    },
    [bookAgainLoadingId, fetchBookingDetail, t],
  );

  const renderGeneralItem = useCallback(
    ({ item }: any) => {
      const completed = item.status?.toLowerCase() === 'completed';
      const showRateNow =
        completed && bookingHasPendingCustomerReviews(item.originalBooking);
      return (
        <BookingCard
          bookingId={item.bookingId}
          friendName={item.friendName}
          status={item.status}
          statusColor={item.statusColor}
          date={item.createdAtDate}
          time={item.createdAtTime}
          shopName={item.shopName}
          address={item.address}
          price={item.price}
          image={item.image}
          onBookAgain={
            completed ? () => handleBookAgain(item.id) : undefined
          }
          bookAgainLoading={bookAgainLoadingId === item.id}
          showRateNow={showRateNow}
          onRateNow={
            showRateNow
              ? () =>
                  navigate(SCREEN_NAMES.BOOKING_DETAIL, {
                    bookingId: item.id,
                    flag: 'open-rate-review',
                  })
              : undefined
          }
          onPress={() =>
            navigate(SCREEN_NAMES.BOOKING_DETAIL, { bookingId: item.id })
          }
        />
      );
    },
    [handleBookAgain, bookAgainLoadingId],
  );

  const renderRoutineItem = useCallback(
    ({ item }: { item: any }) => (
      <RoutineBookingCard
        routineBookingId={item.routineBookingId}
        sessionCount={item.pricing?.sessionCount ?? 0}
        totalCents={item.pricing?.totalCents ?? 0}
        currency={item.pricing?.currency}
        routineStatus={item.routineStatus}
        proRespondBy={item.proRespondBy}
        onPress={() =>
          navigate(SCREEN_NAMES.ROUTINE_BOOKING_DETAIL, {
            routineBookingId: item._id,
          })
        }
      />
    ),
    [],
  );

  const isGeneral = bookingScope === 'general';
  const showInitialLoader = isGeneral
    ? !generalLoaded && (bookingsLoading || bookingsFetching)
    : !routineLoaded && (routineLoading || routineFetching);

  const listData = isGeneral ? filteredGeneral : filteredRoutine;
  const showEmpty =
    (isGeneral ? generalLoaded : routineLoaded) &&
    !(isGeneral ? bookingsFetching : routineFetching) &&
    !showInitialLoader &&
    listData.length === 0;

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

      <BookingListScopeTabs value={bookingScope} onChange={handleScopeChange} />

      {isGeneral ? (
        <BookingListFilters
          selectedStatus={selectedStatus}
          selectedDate={selectedDate}
          onSelectStatus={setSelectedStatus}
          onOpenCalendar={() => {
            setCalendarViewingMonth(
              getFirstDayOfMonth(
                selectedDate ?? new Date().toISOString().slice(0, 10),
              ),
            );
            setCalendarModalVisible(true);
          }}
          onClearDate={() => setSelectedDate(null)}
          formatDateDisplay={formatDateDisplay}
          statusOptions={bookingStatusOptions}
        />
      ) : (
        <RoutineStatusFilterBar
          selected={routineStatusFilter}
          onSelect={setRoutineStatusFilter}
        />
      )}

      {showInitialLoader ? (
        <View style={styles.loadingContainer}>
          <LoadingComp visible />
        </View>
      ) : (
        <FlatList
          key={bookingScope}
          data={listData}
          keyExtractor={item =>
            isGeneral ? item.id : item._id || item.routineBookingId
          }
          renderItem={isGeneral ? renderGeneralItem : renderRoutineItem}
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
            showEmpty ? (
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
            (isGeneral ? bookingsFetching : routineFetching) &&
            (isGeneral ? generalPage : routinePage) > 1 ? (
              <View style={styles.paginationLoader}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      {isGeneral ? (
        <BookingListCalendarModal
          visible={calendarModalVisible}
          currentMonth={calendarViewingMonth}
          selectedDate={selectedDate}
          onClose={() => setCalendarModalVisible(false)}
          onDateSelect={(day: DateData) => {
            setSelectedDate(day.dateString);
            setCalendarModalVisible(false);
          }}
        />
      ) : null}
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
