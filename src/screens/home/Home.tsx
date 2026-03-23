import { useState, useCallback, useEffect, useMemo } from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { HomeHeader, HomeMainList, HomeSearchBar } from '@components';
import { SCREEN_NAMES } from '@navigation/ScreenNames';
import { LoadingComp } from '@components/common';
import { useDisableGestures } from '@utils/hooks';
import {
  useGetCategories,
  useGetBanners,
  useGetServiceProviders,
  useGetTopRatedAndTopOfferedServices,
} from '@services/api/queries/appQueries';
import { useAppSelector } from '@store/hooks';
import { checkPermissionAndGetFcmToken } from '@services/PushNotification';
import { updateFcmToken } from '@services/api/queries/authQueries';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  useDisableGestures();
  const navigation = useNavigation<any>();

  const { t } = useTranslation();
  const authToken = useAppSelector(state => state.auth.token);

  // Whenever Home is focused: apply status bar style and update FCM token.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#009BFF');
      }

      let cancelled = false;
      const run = async () => {
        if (!authToken) return;
        const fcmToken = await checkPermissionAndGetFcmToken();
        if (cancelled || !fcmToken) return;
        try {
          await updateFcmToken({
            fcmToken,
            deviceToken: fcmToken,
            deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
          });
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

  const currentCityId = useAppSelector(state => state.app.userCity)?._id;
  const {
    data: providersData,
    isError: providerError,
    refetch: providerReftech,
  } = useGetServiceProviders({ page: 1, limit: 10, currentCityId });

  const {
    data: featuredData,
    isError: featuredError,
    refetch: refetchFeatured,
  } = useGetTopRatedAndTopOfferedServices({
    cityId: currentCityId,
    page: 1,
    limit: 15,
  });

  const isInitialDataSettled = useMemo(() => {
    const categoriesSettled = !!categoriesData || categoriesError;
    const bannersSettled = !!bannersData || bannersError;
    const providersSettled = !!providersData || providerError;
    const featuredSettled = !currentCityId || !!featuredData || featuredError;
    return categoriesSettled && bannersSettled && providersSettled && featuredSettled;
  }, [
    categoriesData,
    categoriesError,
    bannersData,
    bannersError,
    providersData,
    providerError,
    featuredData,
    featuredError,
    currentCityId,
  ]);

  useEffect(() => {
    if (isInitialHomeLoad && isInitialDataSettled) {
      setIsInitialHomeLoad(false);
    }
  }, [isInitialHomeLoad, isInitialDataSettled]);

  // Keep all home sections in skeleton state together on first load.
  const showInitialSkeleton = isInitialHomeLoad && !isInitialDataSettled;
  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchCategories(),
        refetchBanners(),
        providerReftech(),
        refetchFeatured(),
      ]);
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchBanners, providerReftech, refetchFeatured]);

  // Handle city update - refresh home data
  const handleCityUpdate = useCallback(async () => {
    await Promise.all([
      refetchCategories(),
      refetchBanners(),
      refetchFeatured(),
    ]);
  }, [refetchCategories, refetchBanners, refetchFeatured]);

  // Handle search
  const handleSearch = useCallback((text: string) => {
    // TODO: Implement search functionality
    console.log('Search:', text);
  }, []);

  // Handle filter press
  const handleFilterPress = useCallback(() => {
    // TODO: Implement filter functionality
    console.log('Filter pressed');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar
          translucent
          backgroundColor="#009BFF"
          barStyle="light-content"
        />
      <View style={styles.container}>
       
        <HomeHeader
          onCityUpdate={handleCityUpdate}
          onCityUpdateLoading={setIsCityUpdating}
          onNotificationPress={() =>
            navigation.navigate(SCREEN_NAMES.NOTIFICATIONS)
          }
        />

        <HomeSearchBar
          onSearch={handleSearch}
          onFilterPress={handleFilterPress}
          placeholder={t('home.search')}
        />

        <HomeMainList
          refreshing={refreshing}
          onRefresh={onRefresh}
          categoriesData={categoriesData}
          categoriesLoading={showInitialSkeleton}
          categoriesError={categoriesError}
          onRetryCategories={refetchCategories}
          bannersData={bannersData}
          bannersLoading={showInitialSkeleton}
          bannersError={bannersError}
          onRetryBanners={refetchBanners}
          featuredData={featuredData}
          featuredLoading={showInitialSkeleton}
          featuredError={featuredError}
          onRetryFeatured={refetchFeatured}
          providersData={providersData}
          providersLoading={showInitialSkeleton}
          providersError={providerError}
          onRetryProviders={providerReftech}
        />
        <LoadingComp visible={isCityUpdating} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
