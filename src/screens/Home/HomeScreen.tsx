import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Colors, SF, SH, SW, useDisableGestures } from '../../utils';
import {
  BottomBar,
  Container,
  HomeCategory,
  HomeHeader,
  HomeNearServices,
  HomeSearchBar,
  HomeSwiper,
  Spacing,
} from '../../component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import useLocation from '../../utils/hooks/useLocation';
import { RootState, setHomeAddress, setUserCurrentLoc, useGetCategoriesQuery, useGetNearByServicesQuery } from '../../redux';
import { useDispatch, useSelector } from 'react-redux';

const HomeScreen = () => {
  
  const { location, isLocationEnabled, isLoading, retry } = useLocation();

  let userCurrentLoc = useSelector((state: RootState) => state.app.userCurrentLoc);

  useEffect(() => {
    userCurrentLoc && retry();
  }, []);

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

  const { data: categoryData, isLoading: isCatloading, isError, refetch: refetchCategory } = useGetCategoriesQuery();
  const { data: servicesData, isError: isErrorService, isLoading: isServiceloading, refetch: refetchService } = useGetNearByServicesQuery();

  const servicesArr = useMemo(() => servicesData?.data || [], [servicesData]);
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
          <HomeCategory
            categoryData={categoryData}
            isLoading={isCatloading}
            isError={isError}
          />
          <Spacing space={SF(20)} />

          {/* Near By Services Section ========================== */}
          <HomeNearServices
            servicesArr={servicesArr}
            isLoading={isServiceloading}
            isError={isErrorService}
          />
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