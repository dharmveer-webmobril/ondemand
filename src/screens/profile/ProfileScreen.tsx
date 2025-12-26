import { FlatList, StyleSheet } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Container, AppHeader, ProfileHeader, ProfileMenuItem, LogoutModal } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import imagePaths from '@assets';
import { SH } from '@utils/dimensions';
import { useAppDispatch } from '@store/hooks';
import { logout } from '@store/slices/authSlice';

interface MenuItem {
  id: string;
  label: string;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems: MenuItem[] = [
    { id: '1', label: t('profile.profileSetup') },
    { id: '2', label: t('profile.changePassword') },
    { id: '3', label: t('profile.myAddress') },
    { id: '4', label: t('profile.paymentHistory1') },
    { id: '5', label: t('profile.ratingsReviews') },
    { id: '6', label: t('profile.loyaltyReferralDiscounts') },
    { id: '7', label: t('profile.multiLanguageCurrency') },
    { id: '8', label: t('profile.notificationsAlerts') },
    { id: '9', label: t('profile.customerSupport') },
 
    { id: '10', label: t('profile.logout'), showArrow: false },
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    console.log(item);
    
    // if (item.id === '1') {
    //   // Profile Setup
    //   navigation.navigate('ProfileSetup' as never);
    // } else if (item.id === '2') {
    //   // Service Management
    //   navigation.navigate('ChangePassword' as never);
    // } else if (item.id === '3') {
    //   navigation.navigate('MyAddress' as never);
    // } else if (item.id === '5') {
    //   // Team Management
    //   navigation.navigate('TeamMembers' as never);
    // } else if (item.id === '6') {
    //   // Business Details
    //   navigation.navigate('BusinessDetails' as never);
    // } else if (item.id === '3') {
    //   // Marketing & Promotions
    //   navigation.navigate('MarketingPromotions' as never);
    // } else if (item.id === '8') {
    //   // Subscription
    //   navigation.navigate('Subscription' as never);
    // } else if (item.id === '10') {
    //   // Change Password
    //   navigation.navigate('ChangePassword' as never);
    // } else if (item.id === '11') {
    //   // Multi Language & Currency
    //   navigation.navigate('LanguageSettings' as never);
    // } else if (item.id === '8') { // Subscription
    //   navigation.navigate('Subscription' as never);
    // } else if (item.id === '9') {
    //   // Payments Withdraw & History
    //   navigation.navigate('Payments' as never);
    // } else if (item.id === '12') {
    //   // Notifications & Alerts
    //   navigation.navigate('NotificationsAlerts' as never);
    // } else if (item.id === '13') {
    //   // Customer Support
    //   navigation.navigate('CustomerSupport' as never);
    // } else if (item.id === '14') {
    //   // Logout
    //   setShowLogoutModal(true);
    // } else {
    //   // Handle other menu items
    //   console.log('Pressed:', item.label);
    // }
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader title={t('profile.headerTitle')} />
      <ProfileHeader
        name="John Kevin"
        phone="+91 1234567890"
        image={imagePaths.recomanded1}
        onEditPress={() => navigation.navigate('ProfileSetup' as never)}
        onSharePress={() => navigation.navigate('ShareProfile' as never)}
      />
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileMenuItem
            label={item.label}
            onPress={() => handleMenuItemPress(item)}
            showArrow={item.showArrow}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={() => {
          dispatch(logout());
          setShowLogoutModal(false);
        }}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F7F7F7',
  },
  listContent: {
    paddingTop: theme.SH(20),
    paddingBottom: SH(90),
  },
});
