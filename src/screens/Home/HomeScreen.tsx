import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import {  Colors, SF, SH, SW, useDisableGestures } from '../../utils';
import {
  BottomBar,
  Container,
  HomeHeader,
  HomeNearServiceItem,
  HomeSearchBar,
  HomeSwiper,
  Spacing,
} from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import HomeCategory from '../../component/HomeComp/HomeCategoryItem';
// import useLocation from '../../utils/hooks/useLocation';

const HomeScreen = () => {
  // const { location, error, isLocationEnabled } = useLocation();
  // console.log('locationlocation', location, isLocationEnabled);
  // console.log('errorerror', error);

  useDisableGestures();
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor(Colors.themeDarkColor);
      StatusBar.setBarStyle('light-content');
      return () => {
        StatusBar.setBackgroundColor('#ffffff');
        StatusBar.setBarStyle('dark-content');
      };
    }, []),
  );

  return (
    <Container isAuth statusBarStyle="light-content" statusBarColor={Colors.themeDarkColor}>
      <HomeHeader />
      <KeyboardAwareScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.mHorizontal}>
          <HomeSearchBar showFilterIcon={true} />
          </View>
          <Spacing space={SF(10)} />
          {/* Home swiper ========================= */}
          <HomeSwiper />
          <Spacing space={SF(40)} />
          {/* Category Section========================= */}
          {/* <View style={styles.flatListWrapper}> */}
          <HomeCategory  />
          <Spacing space={SF(20)} />
          {/* Near By Services Section ========================== */}
          <HomeNearServiceItem />
        </View>
      </KeyboardAwareScrollView>
      <BottomBar activeTab={RouteName.HOME} />
    </Container>
  );
};

export default HomeScreen;

const commonSpacing = {
  marginTop: SF(17),
  marginBottom: SF(30),
};
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: SH(30),
  },
  container: {
    flex: 1,
    paddingVertical: SH(17),
  },
  mHorizontal: {
    paddingHorizontal: '6.5%',
  },
  swiperContainer: {
    height: SF(180),
    ...commonSpacing,
  },
  flatListWrapper: {
    paddingHorizontal: SW(25),
    paddingRight: SW(20),
    ...commonSpacing,
  },
  flatListContainer: {
    paddingHorizontal: '7%',
    backgroundColor: '#EEF6F9',
    paddingVertical: SH(20),
    ...commonSpacing,
  },
  flatListRecommended: {
    marginHorizontal: SW(25),
    ...commonSpacing,
  },
});