import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppHeader, AppText, BottomBar, Container, ImageLoader, LogoutPopup, ProfileList } from '../../component';
import { Colors, Fonts, SF, SH, SW, useDisableGestures } from '../../utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import { useTranslation } from 'react-i18next';
import RouteName from '../../navigation/RouteName';

type ProfileProps = {};
const ProfileScreen: React.FC<ProfileProps> = ({ }) => {

  useDisableGestures();
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#ffffff'); // Black color
      StatusBar.setBarStyle('dark-content'); // Light content for dark background
      return () => {
        StatusBar.setBackgroundColor('#ffffff'); // Black color
        StatusBar.setBarStyle('dark-content'); // Dark content for light background
      };
    }, []),
  );

  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [logoutPopup, setLogoutPopup] = useState<any>(false);

  const listData = [
    {
      name: t('profile.profileSetup'),
      id: 1,
      onClick: () => {
        navigation.navigate(RouteName.PROFILE_SETUP);
      },
    },
    {
      name: t('profile.changePassword'),
      id: 2,
      onClick: () => {
        navigation.navigate(RouteName.CHANGE_PASSWORD);
      },
    },
    {
      name: t('profile.myAddress'),
      id: 2,
      onClick: () => {
        navigation.navigate(RouteName.MY_ADDRESS);
      },
    },
    // {
    //   name: t('profile.myCalendar'),
    //   id: 3,
    //   onClick: () => {
    //     navigation.navigate(RouteName.MY_CALENDER);
    //   },
    // },
    {
      name: t('profile.paymentHistory1'),
      id: 12,
      onClick: () => {
        navigation.navigate(RouteName.PAYMENT_HISTORY);
      },
    },
    {
      name: t('profile.ratingsReviews'),
      id: 5,
      onClick: () => {
        navigation.navigate(RouteName.RATING_REVIEW);
      },
    },
    { name: t('profile.loyaltyReferralDiscounts'), id: 6, onClick: () => { navigation.navigate(RouteName.LOYALTY_DISCOUNT) } },
    { name: t('profile.multiLanguageCurrency'), id: 7, onClick: () => { navigation.navigate(RouteName.LANG_CURRENCY); } },
    {
      name: t('profile.notificationsAlerts'),
      id: 8,
      onClick: () => {
        navigation.navigate(RouteName.NOTIFICATION_ALERT);
      },
    },
    { name: t('profile.customerSupport'), id: 9, onClick: () => { navigation.navigate(RouteName.CUSTOMER_SUPPORT); } },
    { name: t('profile.logout'), id: 10, onClick: () => { setLogoutPopup(true) } },
  ];
  const seperatorComponent = () => <View style={styles.separator} />;
  return (
    <Container>
      <AppHeader
        headerTitle={t('profile.headerTitle')}
        onPress={() => { }}
        rightOnPress={() => { }}
        headerStyle={styles.headerStyle}
      />

      <View style={styles.mainContainer}>
        <View style={styles.userInfoContainer}>
          <View style={styles.userConImage}>
            <ImageLoader
              source={imagePaths.user_img}
              resizeMode="cover"
              mainImageStyle={styles.userImage}
            />
          </View>
          <View style={styles.userDetailsContainer}>
            <AppText style={styles.userName}>John Kevin</AppText>
            <AppText style={styles.userPhone}>+91 1234567890</AppText>
          </View>
          <ImageLoader
            source={imagePaths.edit_profile}
            resizeMode="cover"
            mainImageStyle={styles.editProfileIcon}
          />
        </View>
      </View>
      <FlatList
        data={listData}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SH(90),
          marginHorizontal: SW(25),
        }}
        ItemSeparatorComponent={() => seperatorComponent()}
        renderItem={({ item }) => <ProfileList item={item} />}
        keyExtractor={item => item.name}
        removeClippedSubviews={false}
      />
      <LogoutPopup closeModal={() => { setLogoutPopup(false) }} modalVisible={logoutPopup} />
      <BottomBar
        activeTab={RouteName.PROFILE}
      />
    </Container>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: Colors.bgwhite,
  },
  mainContainer: {
    paddingHorizontal: SW(25),
    paddingVertical: SH(20),
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userConImage: {
    width: SF(70),
    height: SF(70),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderColor,
    borderRadius: SF(68) / 2,
  },
  userImage: {
    width: SF(66),
    height: SF(66),
    borderRadius: SF(66) / 2,
  },
  userDetailsContainer: {
    width: '60%',
  },
  userName: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(16),
  },
  userPhone: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    marginTop: SH(3.5),
  },
  editProfileIcon: {
    width: SF(40),
    height: SF(40),
    borderRadius: SF(10),
  },
  separator: {
    height: SH(15),
  },
});
