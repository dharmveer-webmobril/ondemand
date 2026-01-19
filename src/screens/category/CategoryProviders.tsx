import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import React, { useMemo, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, CustomInput, CustomText, VectoreIcons, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import CategoryTabs from '@components/category/CategoryTabs';
import ServiceProviderListItem from '@components/category/ServiceProviderListItem';
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import { Category, useGetCategories, useGetServiceProviders, ServiceProvider, ServiceProvidersResponse, GetServiceProvidersParams } from '@services/api/queries/appQueries';
import imagePaths from '@assets';
import SCREEN_NAMES from '@navigation/ScreenNames';
import useDebounce from '@utils/hooks/useDebounce';

type DeliveryMode = 'at_home' | 'online' | 'on_premises';

export default function CategoryProviders() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce delay
  const routeCategory = (route.params as any)?.category as Category | undefined;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    routeCategory || null
  );
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('at_home');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProviders, setAllProviders] = useState<ServiceProvider[]>([]);
  const [hasReceivedData, setHasReceivedData] = useState(false);

  // Get all categories for tabs
  const { data: categoriesData } = useGetCategories();
  const categories = useMemo(() => {
    return categoriesData?.ResponseData?.filter((cat: Category) => cat.status) || [];
  }, [categoriesData]);

  // Build query params - only include categoryIds if a specific category is selected (not "All")
  const queryParams = useMemo(() => {
    const params: GetServiceProvidersParams = {
      page: currentPage,
      limit: 10,
    };

    // Only add categoryIds if a specific category is selected (not "All")
    if (selectedCategory && selectedCategory._id) {
      params.categoryIds = [selectedCategory._id];
    }

    // Only add search if not empty
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    console.log('Query params:', params);
    return params;
  }, [currentPage, selectedCategory, debouncedSearchQuery]);

  // Fetch providers with pagination and search
  const {
    data: providersData,
    isLoading: providersLoading,
    isError: providersError,
    refetch: refetchProviders
  } = useGetServiceProviders(queryParams);

  // Reset providers when category or search changes
  React.useEffect(() => {
    setCurrentPage(1);
    setAllProviders([]);
    setHasReceivedData(false); // Reset flag when category or search changes
  }, [selectedCategory?._id, debouncedSearchQuery]);

  // Accumulate providers from all pages
  React.useEffect(() => {
    const data = providersData as ServiceProvidersResponse | undefined;
    console.log('providersData changed:', data ? 'has data' : 'no data', 'currentPage:', currentPage);
    if (data?.ResponseData) {
      console.log('Setting providers data:', data.ResponseData.length, 'items, page:', currentPage);
      setHasReceivedData(true);
      if (currentPage === 1) {
        console.log('Setting allProviders for page 1:', data.ResponseData.length);
        setAllProviders(data.ResponseData);
      } else {
        console.log('Appending to allProviders for page:', currentPage);
        setAllProviders(prev => {
          const newProviders = [...prev, ...data.ResponseData];
          console.log('New total providers:', newProviders.length);
          return newProviders;
        });
      }
    } else if (data && Array.isArray(data.ResponseData) && data.ResponseData.length === 0) {
      // Empty response - still mark as received
      console.log('Empty ResponseData received');
      setHasReceivedData(true);
      if (currentPage === 1) {
        setAllProviders([]);
      }
    } else {
      console.log('No ResponseData in providersData, data:', data);
    }
  }, [providersData, currentPage]);

  // Use providers directly from API (search is handled server-side)
  const filteredProviders = useMemo(() => {
    console.log('filteredProviders memo - allProviders length:', allProviders.length);
    return allProviders;
  }, [allProviders]);

  const hasMore = useMemo(() => {
    const data = providersData as ServiceProvidersResponse | undefined;
    if (!data?.pagination) return false;
    return currentPage < data.pagination.pages;
  }, [providersData, currentPage]);

  // Check if we should show empty state
  // Only show empty state if we've received data and it's actually empty (not just loading)
  const shouldShowEmptyState = useMemo(() => {
    // Don't show empty state if still loading
    if (providersLoading) return false;
    // Don't show empty state if there's an error (error state will be shown separately)
    if (providersError) return false;
    // Don't show empty state if we haven't received any data yet
    if (!hasReceivedData) return false;
    // Only show empty state if we have received data and filtered providers is empty
    return filteredProviders.length === 0;
  }, [providersLoading, providersError, hasReceivedData, filteredProviders]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !providersLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, providersLoading]);

  const handleProviderPress = useCallback((provider: ServiceProvider) => {
    (navigation as any).navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
      provider: {
        id: provider._id,
        name: provider.name,
        logo: provider.profileImage,
        address: provider.businessProfile?.address || provider.city?.name || '',
        serviceType: provider.businessProfile?.name || 'Service Provider',
        rating: provider.rating,
        reviewCount: 0,
      },
    });
  }, [navigation]);

  const handleDeliveryModeConfirm = useCallback((mode: DeliveryMode) => {
    setDeliveryMode(mode);
    // Apply delivery mode filter to providers
  }, []);

  const handleReload = useCallback(() => {
    setCurrentPage(1);
    setAllProviders([]);
    refetchProviders();
  }, [refetchProviders]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    // Reset pagination and clear providers when clearing search
    setCurrentPage(1);
    setAllProviders([]);
    setHasReceivedData(false);
  }, []);



  return (
    <Container safeArea={true} style={styles.container}>
      <View style={styles.searchContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <VectoreIcons
            icon="FontAwesome"
            name="angle-left"
            size={theme.SF(40)}
            color={theme.colors.text}
          />
        </Pressable>
          <View style={styles.searchInputWrapper}>
            <CustomInput
              placeholder={t('category.search')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={imagePaths.Search}
              rightIcon={searchQuery.length > 0 ? imagePaths.remove : null}
              onRightIconPress={handleClearSearch}
            />
          </View>
      
      </View>
      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedCategoryId={selectedCategory?._id || 'all'}
        onSelectCategory={setSelectedCategory}
      />

      {/* Providers List */}
      {(providersLoading && currentPage === 1) || (!hasReceivedData && !providersError && currentPage === 1) ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : providersError ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.errorText}>{t('category.failedToLoadProviders')}</CustomText>
          <CustomButton
            title={t('category.reload')}
            onPress={handleReload}
            buttonStyle={styles.reloadButton}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.whitetext}
            paddingHorizontal={theme.SW(20)}
            marginTop={theme.SH(10)}
          />
        </View>
      ) : shouldShowEmptyState ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>
            {debouncedSearchQuery.trim() ? t('category.noProvidersFound') : t('category.noProvidersAvailable')}
          </CustomText>
          {!debouncedSearchQuery.trim() && (
            <CustomButton
              title={t('category.reload')}
              onPress={handleReload}
              buttonStyle={styles.reloadButton}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.whitetext}
              paddingHorizontal={theme.SW(20)}
              marginTop={theme.SH(10)}
            />
          )}
        </View>
      ) : filteredProviders && filteredProviders.length > 0 ? (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ServiceProviderListItem
              id={item._id}
              name={item.name}
              logo={item.profileImage}
              images={item.businessProfile?.portfolioImages || []}
              address={item.businessProfile?.address || item.city?.name || ''}
              rating={typeof item.rating === 'number' ? item.rating : 0}
              reviewCount={0}
              serviceType={item.businessProfile?.name}
              isVerified={item.isVerified}
              isOpen={item.status === '1'}
              onPress={() => handleProviderPress(item)}
              providerId={item._id}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            providersLoading && currentPage > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : hasMore ? (
              <Pressable onPress={handleLoadMore} style={styles.loadMoreButton}>
                <CustomText style={styles.loadMoreText}>{t('category.loadMore')}</CustomText>
              </Pressable>
            ) : null
          }
        />
      ) : null}

      {/* Delivery Mode Modal */}
      <DeliveryModeModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={handleDeliveryModeConfirm}
        selectedMode={deliveryMode}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background || '#F5F5F5',
    },

    searchContainer: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.white,
    },
    searchInput: {
      marginBottom: 0,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SH(40),
    },
    emptyText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    listContent: {
      paddingTop: SH(16),
      paddingBottom: SH(20),
    },
    searchInputWrapper: {
      width: '88%',
    },
    searchInputContainer: {
      flex: 1,
      borderRadius: SW(10),
      paddingHorizontal: SW(10),
      paddingVertical: SH(10),
      height: SH(90),
    },
    clearButton: {
      position: 'absolute',
      right: SW(20),
      top: '50%',
      transform: [{ translateY: -SH(11) }],
      zIndex: 1,
      padding: SW(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.red || '#FF0000',
      textAlign: 'center',
    },
    reloadButton: {
      borderRadius: SF(8),
    },
    footerLoader: {
      paddingVertical: SH(20),
      alignItems: 'center',
    },
    loadMoreButton: {
      paddingVertical: SH(16),
      alignItems: 'center',
    },
    loadMoreText: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
  });
};

