import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Colors, SH, SW, SF, useDisableGestures, navigate } from '../../utils';
import { AppHeader, AppText, BottomBar, Container, LoadingComponent } from '../../component';
import RouteName from '../../navigation/RouteName';
import { BookingItems, TabTop } from '../../component';
import { fetchBookings } from '../../redux';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const MyBookingScreen: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [activeTab, setActiveTabs] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<any>(null);
  const [bookingData, setBookingData] = useState([]);
  const [refreshing, setRefreshing] = useState<boolean>(false); // State for pull-to-refresh
  const dispatch = useDispatch<any>();
  useDisableGestures();

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getData = () => {
    setIsLoading(true);
    const tabs = activeTab === 1 ? 'mybooking' : 'otherbooking';

    dispatch(fetchBookings({ type: tabs }))
      .then((result: any) => {
        let res = result?.payload?.data;
        if (res && res?.data?.length >= 0) {
          res?.data && res?.data?.length > 0 ? setBookingData(res?.data) : setBookingData([]);
          setIsError(null);
        } else {
          setIsError(t('myBookingScreen.messages.noBookings'));
          setBookingData([]);
        }
      })
      .catch((err: any) => {
        setIsError(t('myBookingScreen.messages.error'));
        console.log('errerrerr', err);
      })
      .finally(() => {
        setIsLoading(false);
        setRefreshing(false);
      });
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    getData();
  };

  return (
    <Container statusBarColor={Colors.white}>
      <LoadingComponent visible={isLoading} />
      <AppHeader
        headerTitle={t('myBookingScreen.headerTitle')}
        onPress={() => {}}
        Iconname=""
        headerStyle={styles.headerStyle}
        titleStyle={styles.headerTitleStyle}
      />
      <View style={styles.tabView}>
        <TabTop
          activeTab={activeTab}
          changeTab={(val) => setActiveTabs(val)}
          height={SH(45)}
          tabArr={[t('myBookingScreen.tabs.myBookings'), t('myBookingScreen.tabs.otherBookings')]}
        />
      </View>
      {bookingData && bookingData.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.flatListContainer}
          data={bookingData}
          keyExtractor={(item: any) => `${item?._id}-appointment-list-${activeTab}`}
          renderItem={({ item }) => (
            <BookingItems
              activeTab={activeTab}
              item={item}
              onClick={() => navigate(RouteName.BOOK_DETAILS, { bookingDetail: item, activeTab })}
            />
          )}
          ItemSeparatorComponent={BookingListSeparator}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.themeDarkColor]}
              tintColor={Colors.themeDarkColor}
              title={t('myBookingScreen.messages.refreshing')}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>
            {isLoading
              ? t('myBookingScreen.messages.loading')
              : isError
                ? isError
                : t('myBookingScreen.messages.noBookings')}
          </AppText>
        </View>
      )}
      <BottomBar activeTab={RouteName.MY_BOOKING} />
    </Container>
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    paddingBottom: SH(90),
  },
  separator: {
    height: SH(15),
    backgroundColor: Colors.white,
  },
  headerStyle: {
    backgroundColor: Colors.bgwhite,
    marginVertical: SH(10),
    marginHorizontal: 10,
    marginBottom: SF(20),
  },
  headerTitleStyle: {
    color: Colors.textHeader,
    fontSize: SF(18),
  },
  tabView: {
    paddingHorizontal: SW(20),
    marginBottom: SH(30),
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.lightGraytext },
});

export default MyBookingScreen;

const BookingListSeparator = React.memo(() => <View style={styles.separator} />);