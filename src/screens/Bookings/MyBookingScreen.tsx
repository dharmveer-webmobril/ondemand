import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Colors, SH, SW, SF, useDisableGestures } from '../../utils';
import { AppHeader, AppText, BottomBar, Container, LoadingComponent } from '../../component';
import RouteName from '../../navigation/RouteName';
import { BookingItems, TabTop } from '../../component';
import { fetchBookings, useGetUserBookingsByTabQuery } from '../../redux';
import { useDispatch } from 'react-redux';



const MyBookingScreen: React.FC = () => {
  const [activeTab, setActiveTabs] = useState<number>(1);
  useDisableGestures();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<any>(null);
  const [bookingData, setBookingData] = useState([])
  const dispatch = useDispatch<any>()

  useEffect(() => {
    getData()
  }, [activeTab])

  function getData() {
    setIsLoading(true)
    const tabs = activeTab === 1 ? 'mybooking' : 'otherbooking';

    dispatch(fetchBookings({ type: tabs }))
      .then((result: any) => {
        console.log('resultresultresult', result?.payload?.data);
        let res = result?.payload?.data
        if (res && res?.data?.length >= 0) {
          res?.data && res?.data?.length > 0 ? setBookingData(res?.data) : setBookingData([])
          setIsError(null)
        } else {
          setIsError('Something went wrong');
          setBookingData([])
        }
      })
      .catch((err: any) => {
        setIsError('Something went wrong')
        console.log('errerrerr', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  // const { data: bookingData = [], isFetching, isError, refetch, } = useGetUserBookingsByTabQuery({ tab: activeTab === 1 ? 'mybooking' : 'otherbooking' });

  // console.log('bookingData--', bookingData);
  // console.log('activeTab--', activeTab);
  // useEffect(() => { refetch() }, [activeTab, refetch]);

  return (
    <Container statusBarColor={Colors.white}>
      <LoadingComponent visible={isLoading} />
      <AppHeader
        headerTitle='Appointment'
        onPress={() => { }}
        Iconname=''
        headerStyle={styles.headerStyle}
        titleStyle={styles.headerTitleStyle}
      />
      <View style={styles.tabView}>
        <TabTop activeTab={activeTab} changeTab={(val) => setActiveTabs(val)} />
      </View>
      {
        bookingData && bookingData.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.flatListContainer}
            data={bookingData}
            keyExtractor={(item: any) => `${item?._id}-appointment-list-${activeTab}`}
            renderItem={({ item }) => { return <BookingItems item={item} /> }}
            ItemSeparatorComponent={BookingListSeparator}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              {isLoading
                ? 'Loading...'
                : isError
                  ? 'No booking found.'
                  : 'No booking found.'}
            </AppText>
          </View>
        )
      }

      <BottomBar
        activeTab={RouteName.MY_BOOKING}
      />
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
    marginBottom: SF(20)
  },
  headerTitleStyle: {
    color: Colors.textHeader,
    fontSize: SF(18),
  },
  tabView: {
    paddingHorizontal: SW(20),
    marginBottom: SH(30)
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.lightGraytext },
});

export default MyBookingScreen;

const BookingListSeparator = React.memo(() => <View style={styles.separator} />);