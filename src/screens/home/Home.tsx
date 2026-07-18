import React,{ useState, useCallback, useEffect, useMemo } from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { HomeHeader, HomeMainList, HomeSearchBar, VectoreIcons } from '@components';
import GlassSkyButton from '@components/home/GlassSkyButton';
import { SCREEN_NAMES } from '@navigation/ScreenNames';
import { TAB_BAR_BASE_HEIGHT } from '@navigation/tabs/CustomTabs';
import { useDisableGestures, useHomeCurrentAddress } from '@utils/hooks';
import {
  useGetCategories,
  useGetBanners,
  useGetServiceProviders,
  //@ts-ignore
  useGetTopRatedServices,
  //@ts-ignore
  useGetTopOfferedServices,
  //@ts-ignore
  extractFeaturedServicesArray,
} from '@services/api/queries/appQueries';
import {
  useGetNotificationsUnreadCount,
  parseNotificationsUnreadCount,
} from '@services/api/queries/notificationQueries';
import { useAppSelector } from '@store/hooks';
import { checkPermissionAndGetFcmToken } from '@services/PushNotification';
import { syncFcmTokenToBackendIfNeeded } from '@services/api/queries/authQueries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '@utils/theme';
import { ENTER_EASING, SCREEN_ENTER_MS } from '@utils/animations';

export default function Home() {
  useDisableGestures();
  useHomeCurrentAddress();
  const navigation = useNavigation<any>();
  const theme = useThemeContext();
  const fabBottom = useMemo(
    () => theme.SH(TAB_BAR_BASE_HEIGHT) + theme.SH(16),
    [theme],
  );

  const { t } = useTranslation();
  const authToken = useAppSelector(state => state.auth.token);

  const {
    data: notificationsUnreadData,
    refetch: refetchNotificationsUnreadCount,
  } = useGetNotificationsUnreadCount(!!authToken);
  const notificationUnreadCount = parseNotificationsUnreadCount(
    notificationsUnreadData,
  );

  useFocusEffect(
    useCallback(() => {
      if (!authToken) return;
      refetchNotificationsUnreadCount();
    }, [authToken, refetchNotificationsUnreadCount]),
  );

  const cityName =
    useAppSelector(state => {
      const fromAddr =
        state.app.currentLocationAddress?.cityName?.trim() || '';
      const uc = state.app.userCity;
      const fromSavedCity =
        typeof uc === 'object' && uc?.name
          ? String(uc.name).trim()
          : '';
      return fromAddr || fromSavedCity || '';
    }) || '';

  const providerCoords = useAppSelector(state => {
    const a = state.app.currentLocationAddress;
    const lat = a?.lat?.trim() || '';
    const lng = a?.lng?.trim() || '';
    return { lat, lng };
  });

  // Whenever Home is focused: apply status bar style and update FCM token.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }

      let cancelled = false;
      const run = async () => {
        if (!authToken) return;
        const fcmToken = await checkPermissionAndGetFcmToken();
        if (cancelled || !fcmToken) return;
        try {
          await syncFcmTokenToBackendIfNeeded(
            fcmToken,
            Platform.OS === 'ios' ? 'ios' : 'android',
          );
        } catch (err) {
          console.warn('Failed to update FCM token:', err);
        }
      };
      run();
      return () => {
        cancelled = true;
      };
    }, [authToken]),
  );

  const [refreshing, setRefreshing] = useState(false);
  const [isCityUpdating, setIsCityUpdating] = useState(false);
  const [isInitialHomeLoad, setIsInitialHomeLoad] = useState(true);

  // Fetch categories and banners
  const {
    data: categoriesData,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useGetCategories();

  const {
    data: bannersData,
    isError: bannersError,
    refetch: refetchBanners,
  } = useGetBanners();

  const {
    data: providersData,
    isError: providerError,
    isFetching: providersFetching,
    refetch: providerReftech,
  } = useGetServiceProviders({
    page: 1,
    limit: 10,
    cityName,
    lat: providerCoords.lat,
    lng: providerCoords.lng,
  });

  const {
    data: topRatedProvidersData,
    isError: topRatedProvidersError,
    isFetching: topRatedProvidersFetching,
    refetch: refetchTopRatedProviders,
  } = useGetServiceProviders({
    page: 1,
    limit: 4,
    cityName,
    sortBy: 'ratingonhome',
  });

  const {
    data: topRatedRaw,
    isError: topRatedError,
    isFetching: topRatedFetching,
    isFetched: topRatedFetched,
    refetch: refetchTopRated,
  } = useGetTopRatedServices({
    cityName,
    page: 1,
    limit: 4,
  });

  const {
    data: topOfferedRaw,
    isError: topOfferedError,
    isFetching: topOfferedFetching,
    isFetched: topOfferedFetched,
    refetch: refetchTopOffered,
  } = useGetTopOfferedServices({
    cityName,
    page: 1,
    limit: 4,
  });

  const topRatedServices = useMemo(
    () => extractFeaturedServicesArray(topRatedRaw),
    [topRatedRaw],
  );
  const topOfferedServices = useMemo(
    () => extractFeaturedServicesArray(topOfferedRaw),
    [topOfferedRaw],
  );

  const hasCity = !!String(cityName || '').trim();
  const featuredLocationSettled =
    !hasCity || (topRatedFetched && topOfferedFetched);

  const isInitialDataSettled = useMemo(() => {
    const categoriesSettled = !!categoriesData || categoriesError;
    const bannersSettled = !!bannersData || bannersError;
    const providersSettled = !!providersData || providerError;
    return (
      categoriesSettled &&
      bannersSettled &&
      providersSettled &&
      featuredLocationSettled
    );
  }, [
    categoriesData,
    categoriesError,
    bannersData,
    bannersError,
    providersData,
    providerError,
    featuredLocationSettled,
  ]);

  useEffect(() => {
    if (isInitialHomeLoad && isInitialDataSettled) {
      setIsInitialHomeLoad(false);
    }
  }, [isInitialHomeLoad, isInitialDataSettled]);

  /** First paint only — categories & banners are master data */
  const showMasterSkeleton = isInitialHomeLoad && !isInitialDataSettled;

  /** City-scoped lists only — providers & featured */
  const showLocationSkeleton =
    isCityUpdating ||
    (!!cityName.trim() &&
      (providersFetching ||
        topRatedProvidersFetching ||
        topRatedFetching ||
        topOfferedFetching));

  // Handle pull to refresh — refresh location listings + promo banners; categories stay cached (master)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBanners(),
        providerReftech(),
        refetchTopRatedProviders(),
        refetchTopRated(),
        refetchTopOffered(),
        refetchNotificationsUnreadCount(),
      ]);
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchBanners,
    providerReftech,
    refetchTopRatedProviders,
    refetchTopRated,
    refetchTopOffered,
    refetchNotificationsUnreadCount,
  ]);

  /** Address / city change — only refetch location-dependent APIs */
  const handleCityUpdate = useCallback(async () => {
    setIsCityUpdating(true);
    try {
      await Promise.all([
        providerReftech(),
        refetchTopRatedProviders(),
        refetchTopRated(),
        refetchTopOffered(),
      ]);
    } finally {
      setIsCityUpdating(false);
    }
  }, [
    providerReftech,
    refetchTopRatedProviders,
    refetchTopRated,
    refetchTopOffered,
  ]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, {
      resetSession: true,
      focusSearch: true,
    });
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, {
      resetSession: true,
      openFilters: true,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Animated.View
        entering={FadeIn.duration(SCREEN_ENTER_MS).easing(ENTER_EASING)}
        style={styles.container}
      >
        <HomeHeader
          onCityUpdate={handleCityUpdate}
          onCityUpdateLoading={setIsCityUpdating}
          notificationUnreadCount={notificationUnreadCount}
          onNotificationPress={() =>
            navigation.navigate(SCREEN_NAMES.NOTIFICATIONS)
          }
        />

        <HomeSearchBar
          onSearchPress={handleSearchPress}
          onFilterPress={handleFilterPress}
          placeholder={t('home.search')}
        />

        <HomeMainList
          refreshing={refreshing}
          onRefresh={onRefresh}
          cityName={cityName}
          categoriesData={categoriesData}
          categoriesLoading={showMasterSkeleton}
          categoriesError={categoriesError}
          onRetryCategories={refetchCategories}
          bannersData={bannersData}
          bannersLoading={showMasterSkeleton}
          bannersError={bannersError}
          onRetryBanners={refetchBanners}
          topRatedServices={topRatedServices}
          topRatedLoading={showMasterSkeleton || showLocationSkeleton}
          topRatedError={topRatedError}
          onRetryTopRated={refetchTopRated}
          topOfferedServices={topOfferedServices}
          topOfferedLoading={showMasterSkeleton || showLocationSkeleton}
          topOfferedError={topOfferedError}
          onRetryTopOffered={refetchTopOffered}
          providersData={providersData}
          providersLoading={showMasterSkeleton || showLocationSkeleton}
          providersError={providerError}
          onRetryProviders={providerReftech}
          topRatedProvidersData={topRatedProvidersData}
          topRatedProvidersLoading={showMasterSkeleton || showLocationSkeleton}
          topRatedProvidersError={topRatedProvidersError}
          onRetryTopRatedProviders={refetchTopRatedProviders}
        />

        <GlassSkyButton
          accessibilityLabel={t('home.quickVoiceTitle')}
          onPress={() => navigation.navigate(SCREEN_NAMES.HOME_QUICK_VOICE)}
          size={theme.SF(56)}
          borderRadius={theme.SF(28)}
          showAiBadge
          style={[
            styles.quickChatFab,
            { bottom: fabBottom, right: theme.SW(16) },
          ]}
          icon={
            <VectoreIcons
              icon="Ionicons"
              name="sparkles"
              size={theme.SF(26)}
              color="#0C4A6E"
            />
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  quickChatFab: {
    position: 'absolute',
    zIndex: 10000,
  },
});
