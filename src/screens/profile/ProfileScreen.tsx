import { FlatList, StyleSheet, View } from 'react-native';
import { useMemo, useState } from 'react';
import {
  Container,
  AppHeader,
  ProfileHeader,
  ProfileMenuItem,
  LogoutModal,
  GuestLoginRequiredModal,
  CustomText,
  CustomButton,
} from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { SH } from '@utils/dimensions';
import { useGuestGuard } from '@utils/hooks';
import { GUEST_BLOCKED_PROFILE_MENU_IDS } from '@utils/guest/guestAuth';

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
  const {
    isGuest,
    modalVisible,
    modalMessage,
    promptLogin,
    closeModal,
    goToLogin,
  } = useGuestGuard();

  const menuItems: MenuItem[] = useMemo(() => {
    if (isGuest) {
      return [
        {
          id: '7',
          label: t('profile.multiLanguageCurrency'),
          icon: { name: 'language-outline', icon: 'Ionicons' },
        },
        {
          id: '9',
          label: t('profile.customerSupport'),
          icon: { name: 'headset-outline', icon: 'Ionicons' },
        },
        {
          id: 'guest_signin',
          label: t('guest.signInOrRegister'),
          showArrow: true,
          icon: { name: 'log-in-outline', icon: 'Ionicons' },
        },
      ];
    }

    return [
      {
        id: 'security',
        label: t('profile.securitySettings'),
        icon: { name: 'shield-checkmark-outline', icon: 'Ionicons' },
      },
      {
        id: '2',
        label: t('profile.changePassword'),
        icon: { name: 'lock-closed-outline', icon: 'Ionicons' },
      },
      {
        id: '3',
        label: t('profile.myAddress'),
        icon: { name: 'location-outline', icon: 'Ionicons' },
      },
      {
        id: 'bookmarks',
        label: t('profile.bookmarkedProviders'),
        icon: { name: 'heart-outline', icon: 'Ionicons' },
      },
      {
        id: 'transactions',
        label: t('profile.transactions'),
        icon: { name: 'receipt-outline', icon: 'Ionicons' },
      },
      {
        id: 'wallet',
        label: t('wallet.title'),
        icon: { name: 'wallet-outline', icon: 'Ionicons' },
      },
      {
        id: '6',
        label: t('profile.loyaltyReferralDiscounts'),
        icon: { name: 'gift-outline', icon: 'Ionicons' },
      },
      {
        id: '7',
        label: t('profile.multiLanguageCurrency'),
        icon: { name: 'language-outline', icon: 'Ionicons' },
      },
      {
        id: '8',
        label: t('profile.notificationsAlerts'),
        icon: { name: 'notifications-outline', icon: 'Ionicons' },
      },
      {
        id: '9',
        label: t('profile.customerSupport'),
        icon: { name: 'headset-outline', icon: 'Ionicons' },
      },
      {
        id: '10',
        label: t('profile.logout'),
        showArrow: false,
        icon: { name: 'log-out-outline', icon: 'Ionicons' },
      },
    ];
  }, [isGuest, t]);

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.id === 'guest_signin') {
      goToLogin();
      return;
    }

    if (isGuest && GUEST_BLOCKED_PROFILE_MENU_IDS.has(item.id)) {
      promptLogin(t('guest.featureRequiresLogin'));
      return;
    }

    if (item.id === 'security') {
      navigation.navigate(SCREEN_NAMES.SECURITY_SETTINGS as never);
    } else if (item.id === '2') {
      navigation.navigate('ChangePassword' as never);
    } else if (item.id === '3') {
      navigation.navigate('MyAddress' as never);
    } else if (item.id === 'bookmarks') {
      navigation.navigate(SCREEN_NAMES.FAVORITE_PROVIDERS as never);
    } else if (item.id === 'transactions') {
      navigation.navigate(SCREEN_NAMES.PAYMENT_TRANSACTIONS as never);
    } else if (item.id === 'wallet') {
      navigation.navigate(SCREEN_NAMES.WALLET as never);
    } else if (item.id === '9') {
      navigation.navigate(SCREEN_NAMES.CUSTOMER_SUPPORT as never);
    } else if (item.id === '8') {
      navigation.navigate(SCREEN_NAMES.NOTIFICATIONS_ALERTS as never);
    } else if (item.id === '7') {
      navigation.navigate(SCREEN_NAMES.LANGUAGE_SETTINGS as never);
    } else if (item.id === '10') {
      setShowLogoutModal(true);
    }
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader title={t('profile.headerTitle')} />
      {isGuest ? (
        <View style={styles.guestBanner}>
          <CustomText style={styles.guestBannerText}>
            {t('guest.profileBanner')}
          </CustomText>
          <CustomButton
            title={t('guest.signIn')}
            onPress={goToLogin}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.whitetext}
            buttonStyle={styles.guestBannerButton}
          />
        </View>
      ) : null}
      <ProfileHeader
        onEditPress={() => {
          if (isGuest) {
            promptLogin(t('guest.featureRequiresLogin'));
            return;
          }
          navigation.navigate('ProfileSetup' as never);
        }}
      />
      <FlatList
        data={menuItems}
        keyExtractor={item => item.id}
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

      <GuestLoginRequiredModal
        visible={modalVisible}
        message={modalMessage}
        onClose={closeModal}
        onLogin={goToLogin}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
    },
    guestBanner: {
      marginHorizontal: theme.SW(20),
      marginTop: theme.SH(12),
      padding: theme.SW(14),
      borderRadius: theme.SW(12),
      backgroundColor: theme.colors.primary + '14',
      borderWidth: 1,
      borderColor: theme.colors.primary + '33',
    },
    guestBannerText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
      lineHeight: theme.SF(20),
      marginBottom: theme.SH(10),
    },
    guestBannerButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.SW(18),
      minWidth: theme.SW(120),
    },
    listContent: {
      paddingTop: theme.SH(20),
      paddingBottom: SH(90),
    },
  });
