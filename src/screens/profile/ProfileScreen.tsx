import { FlatList, StyleSheet } from 'react-native'
import { useMemo, useState } from 'react'
import { Container, AppHeader, ProfileHeader, ProfileMenuItem, LogoutModal } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SH } from '@utils/dimensions';

type IconType =
  | 'Feather'
  | 'AntDesign'
  | 'Fontisto'
  | 'MaterialCommunityIcons'
  | 'FontAwesome'
  | 'EvilIcons'
  | 'Entypo'
  | 'Ionicons'
  | 'Octicons'
  | 'FontAwesome5'
  | 'MaterialIcons'
  | 'FontAwesome6';

interface MenuItem {
  id: string;
  label: string;
  showArrow?: boolean;
  icon?: {
    name: string;
    icon: IconType;
  };
}

export default function ProfileScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems: MenuItem[] = [
    // { id: '1', label: t('profile.profileSetup'), icon: { name: 'person-outline', icon: 'Ionicons' } },
    { id: '2', label: t('profile.changePassword'), icon: { name: 'lock-closed-outline', icon: 'Ionicons' } },
    { id: '3', label: t('profile.myAddress'), icon: { name: 'location-outline', icon: 'Ionicons' } },
    { id: '4', label: t('profile.paymentHistory1'), icon: { name: 'card-outline', icon: 'Ionicons' } },
    // { id: '5', label: t('profile.ratingsReviews'), icon: { name: 'star-outline', icon: 'Ionicons' } },
    { id: '6', label: t('profile.loyaltyReferralDiscounts'), icon: { name: 'gift-outline', icon: 'Ionicons' } },
    { id: '7', label: t('profile.multiLanguageCurrency'), icon: { name: 'language-outline', icon: 'Ionicons' } },
    { id: '8', label: t('profile.notificationsAlerts'), icon: { name: 'notifications-outline', icon: 'Ionicons' } },
    { id: '9', label: t('profile.customerSupport'), icon: { name: 'headset-outline', icon: 'Ionicons' } },
    { id: '10', label: t('profile.logout'), showArrow: false, icon: { name: 'log-out-outline', icon: 'Ionicons' } },
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.id === '1') {
      // Profile Setup
      navigation.navigate('ProfileSetup' as never);
    } else if (item.id === '2') {
      // Change Password
      navigation.navigate('ChangePassword' as never);
    } else if (item.id === '3') {
      // My Address
      navigation.navigate('MyAddress' as never);
    } else if (item.id === '10') {
      // Logout
      setShowLogoutModal(true);
    } else {
      // Handle other menu items
      console.log('Pressed:', item.label);
    }
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader title={t('profile.headerTitle')} />
      <ProfileHeader
        onEditPress={() => navigation.navigate('ProfileSetup' as never)}
      />
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileMenuItem
            label={item.label}
            onPress={() => handleMenuItemPress(item)}
            showArrow={item.showArrow}
            icon={item.icon}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
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
