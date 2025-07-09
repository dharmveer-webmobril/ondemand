import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Keyboard } from 'react-native';
import { Colors, SH, SW, Fonts, SF, boxShadow, commonStyles, nearByData, useDisableGestures } from '../../utils';
import { AppHeader, AppText, BottomBar, Buttons, Container, ImageLoader } from '../../component';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { TabTop } from './component';



const MyBookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTabs] = useState<number>(1);
  useDisableGestures();
  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => navigation.navigate(RouteName.BOOK_DETAILS)} style={styles.serviceContainer}>
      <View style={styles.header}>
        <View style={[styles.imageWrapper, boxShadow]}>
          <ImageLoader source={{ uri: item.image }} resizeMode="cover" mainImageStyle={styles.logo} />
        </View>
        <View style={styles.infoContainer}>
          <AppText style={styles.text}>Haircut + Beard <AppText style={{ color: Colors.lightGraytext }}>With Juana</AppText></AppText>
          <AppText style={styles.dateTime}>{`06-March-2025 ${'\n'}8:00 am - 8:30 am`}</AppText>
          <AppText style={styles.dateTime}>{`WM Barbershop`}</AppText>
          <AppText style={styles.dateTime}>{`1893 Cheshire Bridge Rd Ne, 30325`}</AppText>
          <View style={[commonStyles.rowSpaceBetweenCss, { marginTop: SF(7) }]}>
            <AppText style={styles.price}>{`$1893`}</AppText>
            <Buttons
              isExtraBoxShadow={false}
              buttonStyle={styles.bookAgain}
              textColor={Colors.textWhite}
              buttonTextStyle={styles.bookAgainText}
              title={'Book Again'}
              onPress={() => {
                Keyboard.dismiss();
              }}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );

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
      <FlatList
        contentContainerStyle={styles.flatListContainer}
        data={nearByData}
        keyExtractor={(item) => `${item.id}-appointment-list`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsHorizontalScrollIndicator={false}
      />
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
  serviceContainer: {
    marginHorizontal: SW(20),
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: SW(15),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width: SF(82),
    height: SF(113),
    borderRadius: SF(10) / 2,
    overflow: 'hidden'
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: SF(10)
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SW(10),
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    maxWidth: '80%',
  },
  dateTime: {
    color: Colors.lightGraytext,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(8),
    maxWidth: '80%',
    marginTop: SH(3)
  },

  price: {
    color: Colors.themeColor,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(16),
    maxWidth: '80%',
    marginTop: 3

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
  bookAgain: {
    backgroundColor: Colors.themeColor,
    height: SF(22),
    width: SW(75),
    alignSelf: 'flex-end',
    borderRadius: SF(6)
  },
  bookAgainText: {
    fontSize: SF(10),
    fontFamily: Fonts.SEMI_BOLD
  },
  tabView: { paddingHorizontal: SW(20), marginBottom: SH(30) }
});

export default MyBookingScreen;