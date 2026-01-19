import { useState, useCallback } from "react";
import { StatusBar, View, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { HomeHeader, HomeMainList, HomeSearchBar } from "@components";
import { LoadingComp } from "@components/common";
import { useDisableGestures } from "@utils/hooks";
import { useGetCategories, useGetBanners, useGetServiceProviders } from "@services/api/queries/appQueries";

export default function Home() {
  useDisableGestures()
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [isCityUpdating, setIsCityUpdating] = useState(false);

  // Fetch categories and banners
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories
  } = useGetCategories();

  const {
    data: bannersData,
    isLoading: bannersLoading,
    isError: bannersError,
    refetch: refetchBanners
  } = useGetBanners();

  const { 
    data: providersData, 
    isFetching:providerLoading, 
    isError:providerError, 
    refetch:providerReftech 
  } = useGetServiceProviders({ page: 1, limit: 10 });
console.log('providersData', providersData);
  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Refetch both categories and banners
      await Promise.all([
        refetchCategories(),
        refetchBanners()
      ]);
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchBanners]);

  // Handle city update - refresh home data
  const handleCityUpdate = useCallback(async () => {
    await Promise.all([
      refetchCategories(),
      refetchBanners(),
    ]);
  }, [refetchCategories, refetchBanners, ]);

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
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <HomeHeader
        onCityUpdate={handleCityUpdate}
        onCityUpdateLoading={setIsCityUpdating}
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
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={refetchCategories}
        bannersData={bannersData}
        bannersLoading={bannersLoading}
        bannersError={bannersError}
        onRetryBanners={refetchBanners}
        providersData={providersData}
        providersLoading={providerLoading}
        providersError={providerError}
        onRetryProviders={providerReftech}
      />
      <LoadingComp visible={isCityUpdating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
