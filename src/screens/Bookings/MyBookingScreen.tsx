import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Colors, SH, SW, SF, useDisableGestures } from '../../utils';
import { AppHeader, AppText, BottomBar, Container } from '../../component';
import RouteName from '../../navigation/RouteName';
import { BookingItems, TabTop } from './component';
import { useGetUserBookingsByTabQuery } from '../../redux';



const MyBookingScreen: React.FC = () => {
  const [activeTab, setActiveTabs] = useState<number>(1);
  useDisableGestures();

  const { data: bookingData = [], isFetching, isError, refetch, } = useGetUserBookingsByTabQuery({ tab: activeTab === 1 ? 'mybooking' : 'otherbooking' });

  console.log('bookingData--', bookingData);
  useEffect(() => { refetch() }, [activeTab, refetch]);

  return (
    <Container statusBarColor={Colors.white}>
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
            keyExtractor={(item) => `${item._id}-appointment-list-${activeTab}`}
            renderItem={({ item }) => { return <BookingItems item={item} /> }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <AppText style={{ color: Colors.lightGraytext }}>
              {isFetching
                ? 'Loading...'
                : isError
                  ? 'Something went wrong!'
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
});

export default MyBookingScreen;