import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, CustomInput, CustomText, VectoreIcons, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import CategoryTabs from '@components/category/CategoryTabs';
import ServiceProviderListItem from '@components/category/ServiceProviderListItem';
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import CategoryProvidersFiltersModal from '@components/category/CategoryProvidersFiltersModal';
import {
  Category,
  useGetCategories,
  useGetServiceProviders,
  ServiceProvidersResponse,
} from '@services/api/queries/appQueries';
import imagePaths from '@assets';
import SCREEN_NAMES from '@navigation/ScreenNames';
import useDebounce from '@utils/hooks/useDebounce';
import { useAppSelector } from '@store/hooks';
import { formatAddress, getProviderDisplayName } from '@utils/tools';

type DeliveryMode = 'at_home' | 'online' | 'on_premises';

type CategoryProvidersRouteParams = {
  category?: Category;
  resetSession?: boolean;
  openFilters?: boolean;
  /** Seed search bar when opening from assistant / deep link */
  initialSearch?: string;
  /** Focus provider search input after navigation (e.g. from Home search tap) */
  focusSearch?: boolean;
};

export default function CategoryProviders() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const routeCategory = (route.params as CategoryProvidersRouteParams | undefined)
    ?.category as Category | undefined;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    routeCategory || null,
  );
  const [appliedMinRating, setAppliedMinRating] = useState('');
  const [appliedMaxDistance, setAppliedMaxDistance] = useState('');
  const [appliedSortBy, setAppliedSortBy] = useState('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState<string>('all');
  const [draftMinRating, setDraftMinRating] = useState('');
  const [draftMaxDistance, setDraftMaxDistance] = useState('');
  const [draftSortBy, setDraftSortBy] = useState('rating');

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('at_home');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  /** When opening from Home’s filter button (`openFilters`), category chips stay hidden. */
  const [showCategoryTabs, setShowCategoryTabs] = useState(true);
  const searchInputRef = useRef<TextInput>(null);

  const { data: categoriesData } = useGetCategories();
  const categories = useMemo(() => {
    return categoriesData?.ResponseData?.filter((cat: Category) => cat.status) || [];
  }, [categoriesData]);

  const cityName =
    useAppSelector(state => {
      const fromAddr = state.app.currentLocationAddress?.cityName?.trim() || '';
      const uc = state.app.userCity;
      const fromSaved =
        typeof uc === 'object' && uc?.name ? String(uc.name).trim() : '';
      return fromAddr || fromSaved || '';
    }) || '';

  const lat = useAppSelector(
    state => state.app.currentLocationAddress?.lat?.trim() || '',
  );
  const lng = useAppSelector(
    state => state.app.currentLocationAddress?.lng?.trim() || '',
  );

  useFocusEffect(
    useCallback(() => {
      const p = (route.params || {}) as CategoryProvidersRouteParams;
      if (p.resetSession) {
        setSearchQuery(p.initialSearch?.trim() ?? '');
        setAppliedMinRating('');
        setAppliedMaxDistance('');
        setAppliedSortBy('rating');
        setDraftCategoryId(p.category?._id ?? 'all');
        setDraftMinRating('');
        setDraftMaxDistance('');
        setDraftSortBy('rating');
        setSelectedCategory(p.category ?? null);
        setCurrentPage(1);
        setAllProviders([]);
        setHasReceivedData(false);
        setShowCategoryTabs(!p.openFilters);
        (navigation as any).setParams({
          resetSession: undefined,
          openFilters: undefined,
          initialSearch: undefined,
          focusSearch: undefined,
        });
        if (p.focusSearch) {
          requestAnimationFrame(() => {
            setTimeout(() => searchInputRef.current?.focus(), 150);
          });
        }
        if (p.openFilters) {
          requestAnimationFrame(() => setFilterModalVisible(true));
        }
        return;
      }
      if (p.openFilters) {
        requestAnimationFrame(() => setFilterModalVisible(true));
        (navigation as any).setParams({ openFilters: undefined });
      }
    }, [navigation, route.params]),
  );

  const filterModalWasOpen = useRef(false);
  useEffect(() => {
    if (filterModalVisible && !filterModalWasOpen.current) {
      setDraftCategoryId(selectedCategory?._id ?? 'all');
      setDraftMinRating(appliedMinRating);
      setDraftMaxDistance(appliedMaxDistance);
      setDraftSortBy(appliedSortBy);
    }
    filterModalWasOpen.current = filterModalVisible;
  }, [
    filterModalVisible,
    selectedCategory?._id,
    appliedMinRating,
    appliedMaxDistance,
    appliedSortBy,
  ]);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: 12,
      cityName,
      lat,
      lng,
      sortBy: appliedSortBy || 'rating',
    };

    if (selectedCategory && selectedCategory._id) {
      params.categoryIds = [selectedCategory._id];
    }

    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    if (appliedMinRating !== '') {
      const n = Number(appliedMinRating);
      if (Number.isFinite(n)) {
        params.minRating = n;
      }
    }

    const md = appliedMaxDistance.trim();
    if (md !== '') {
      const n = Number(md);
      if (Number.isFinite(n) && n >= 0) {
        params.maxDistance = n;
      }
    }

    return params;
  }, [
    currentPage,
    selectedCategory,
    debouncedSearchQuery,
    cityName,
    lat,
    lng,
    appliedMinRating,
    appliedMaxDistance,
    appliedSortBy,
  ]);

  const {
    data: providersData,
    isLoading: providersLoading,
    isError: providersError,
    refetch: refetchProviders,
  } = useGetServiceProviders(queryParams);

  React.useEffect(() => {
    setCurrentPage(1);
    setAllProviders([]);
    setHasReceivedData(false);
  }, [
    selectedCategory?._id,
    debouncedSearchQuery,
    appliedMinRating,
    appliedMaxDistance,
    appliedSortBy,
  ]);

  React.useEffect(() => {
    const data = providersData as ServiceProvidersResponse | undefined;
    if (data?.ResponseData) {
      setHasReceivedData(true);
      if (currentPage === 1) {
        setAllProviders(data.ResponseData);
      } else {
        setAllProviders(prev => [...prev, ...data.ResponseData]);
      }
    } else if (
      data &&
      Array.isArray(data.ResponseData) &&
      data.ResponseData.length === 0
    ) {
      setHasReceivedData(true);
      if (currentPage === 1) {
        setAllProviders([]);
      }
    }
  }, [providersData, currentPage]);

  const filteredProviders = useMemo(() => allProviders, [allProviders]);

  const hasMore = useMemo(() => {
    const data = providersData as ServiceProvidersResponse | undefined;
    if (!data?.pagination) return false;
    return currentPage < data.pagination.pages;
  }, [providersData, currentPage]);

  const maxDistActive = useMemo(() => {
    const md = appliedMaxDistance.trim();
    if (!md) return false;
    const n = Number(md);
    return Number.isFinite(n) && n >= 0;
  }, [appliedMaxDistance]);

  const hasActiveFilters = useMemo(() => {
    return (
      !!debouncedSearchQuery.trim() ||
      appliedMinRating !== '' ||
      maxDistActive ||
      appliedSortBy !== 'rating'
    );
  }, [
    debouncedSearchQuery,
    appliedMinRating,
    maxDistActive,
    appliedSortBy,
  ]);

  const emptyPrimaryMessage = useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      return t('category.noProvidersFound');
    }
    if (hasActiveFilters) {
      return t('category.noProvidersMatchFilters');
    }
    return t('category.noProvidersAvailable');
  }, [debouncedSearchQuery, hasActiveFilters, t]);

  const shouldShowEmptyState = useMemo(() => {
    if (providersLoading) return false;
    if (providersError) return false;
    if (!hasReceivedData) return false;
    return filteredProviders.length === 0;
  }, [providersLoading, providersError, hasReceivedData, filteredProviders]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !providersLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, providersLoading]);

  const handleProviderPress = useCallback(
    (provider: any) => {
      (navigation as any).navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
        provider: {
          id: provider._id,
          name: getProviderDisplayName(provider, 'Service Provider'),
          logo: provider.businessProfile?.bannerImage
            ? { uri: provider.businessProfile?.bannerImage }
            : imagePaths.no_image,
          address:
            formatAddress({
              line1: provider.businessProfile?.line1,
              line2: provider.businessProfile?.line2,
              landmark: provider.businessProfile?.landmark,
              pincode: provider.businessProfile?.pincode,
              city: provider.businessProfile?.city?.name,
              country: provider.businessProfile?.country?.name,
            }) || provider.city?.name || '',
          serviceType: provider.cityName || provider.businessProfile?.cityName || '',
          rating: provider.rating,
          reviewCount: 0,
        },
      });
    },
    [navigation],
  );

  const handleDeliveryModeConfirm = useCallback((mode: DeliveryMode) => {
    setDeliveryMode(mode);
  }, []);

  const handleReload = useCallback(() => {
    setCurrentPage(1);
    setAllProviders([]);
    refetchProviders();
  }, [refetchProviders]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    setAllProviders([]);
    setHasReceivedData(false);
  }, []);

  const openFilterModal = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedMinRating(draftMinRating);
    setAppliedMaxDistance(draftMaxDistance);
    setAppliedSortBy(draftSortBy);
    if (draftCategoryId === 'all') {
      setSelectedCategory(null);
    } else {
      const cat = categories.find(c => c._id === draftCategoryId);
      setSelectedCategory(cat ?? null);
    }
    setFilterModalVisible(false);
  }, [draftCategoryId, draftMinRating, draftMaxDistance, draftSortBy, categories]);

  const handleResetAllFilters = useCallback(() => {
    setDraftCategoryId('all');
    setDraftMinRating('');
    setDraftMaxDistance('');
    setDraftSortBy('rating');
    setAppliedMinRating('');
    setAppliedMaxDistance('');
    setAppliedSortBy('rating');
    setSelectedCategory(null);
    setSearchQuery('');
    setCurrentPage(1);
    setAllProviders([]);
    setHasReceivedData(false);
    setFilterModalVisible(false);
  }, []);
console.log('filteredProviders-----CategoryProviders', filteredProviders);
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
            ref={searchInputRef}
            placeholder={t('category.searchPlaceholderProviders')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={imagePaths.Search}
            rightIcon={searchQuery.length > 0 ? imagePaths.remove : null}
            onRightIconPress={handleClearSearch}
          />
        </View>
        <Pressable
          onPress={openFilterModal}
          style={({ pressed }) => [
            styles.filterButton,
            pressed && styles.filterButtonPressed,
          ]}
        >
          <Image
            source={imagePaths.filter_icon}
            style={[
              styles.filterIcon,
              hasActiveFilters && styles.filterIconActive,
            ]}
            resizeMode="contain"
          />
          {hasActiveFilters ? <View style={styles.filterBadge} /> : null}
        </Pressable>
      </View>

      {showCategoryTabs ? (
        <CategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategory?._id || 'all'}
          onSelectCategory={setSelectedCategory}
        />
      ) : null}

      {(providersLoading && currentPage === 1) ||
      (!hasReceivedData && !providersError && currentPage === 1) ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : providersError ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.errorText}>
            {t('category.failedToLoadProviders')}
          </CustomText>
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
          <CustomText style={styles.emptyText}>{emptyPrimaryMessage}</CustomText>
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
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <ServiceProviderListItem
              id={item._id}
              name={getProviderDisplayName(item, t('bookingList.serviceProviderDefault'))}
              logo={
                item.businessProfile?.bannerImage
                  ? { uri: item.businessProfile?.bannerImage }
                  : imagePaths.no_image
              }
              images={item.businessProfile?.portfolioImages || []}
              address={
                formatAddress({
                  line1: item.businessProfile?.line1,
                  line2: item.businessProfile?.line2,
                  landmark: item.businessProfile?.landmark,
                  pincode: item.businessProfile?.pincode,
                  city: item.businessProfile?.city?.name,
                  country: item.businessProfile?.country?.name,
                }) || item.city?.name || ''
              }
              rating={typeof item.rating === 'number' ? item.rating : 0}
              reviewCount={typeof item.reviewCount === 'number' ? item.reviewCount : 0}
              serviceType={item.cityName || item.businessProfile?.cityName || undefined}
              isVerified={item.isVerified}
              isOpen={item.status === '1'}
              onPress={() => handleProviderPress(item)}
              providerId={item._id}
              distanceKm={item.distanceKm}
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
                <CustomText style={styles.loadMoreText}>
                  {t('category.loadMore')}
                </CustomText>
              </Pressable>
            ) : null
          }
        />
      ) : null}

      <DeliveryModeModal
        visible={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={(mode: any) => handleDeliveryModeConfirm(mode)}
        selectedMode={deliveryMode}
      />

      <CategoryProvidersFiltersModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        categories={categories}
        categoryValue={draftCategoryId}
        minRatingValue={draftMinRating}
        maxDistanceValue={draftMaxDistance}
        sortByValue={draftSortBy}
        onCategoryChange={setDraftCategoryId}
        onMinRatingChange={setDraftMinRating}
        onMaxDistanceChange={setDraftMaxDistance}
        onSortByChange={setDraftSortBy}
        onApply={handleApplyFilters}
        onResetAll={handleResetAllFilters}
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
      paddingHorizontal: SW(12),
      paddingVertical: SH(10),
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
      backgroundColor: Colors.white,
    },
    searchInputWrapper: {
      flex: 1,
      minWidth: 0,
      marginLeft: SW(8),
    },
    filterButton: {
      width: SF(44),
      height: SF(44),
      borderRadius: SF(12),
      backgroundColor: Colors.primary || '#135D96',
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonPressed: {
      opacity: 0.88,
    },
    filterIcon: {
      width: SF(20),
      height: SF(20),
      tintColor: Colors.white,
    },
    filterIconActive: {
      tintColor: '#FFE066',
    },
    filterBadge: {
      position: 'absolute',
      top: SF(6),
      right: SF(6),
      width: SF(8),
      height: SF(8),
      borderRadius: SF(4),
      backgroundColor: '#FF3B30',
      borderWidth: 1,
      borderColor: Colors.white,
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
      paddingHorizontal: SW(24),
    },
    emptyText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      textAlign: 'center',
    },
    listContent: {
      paddingTop: SH(16),
      paddingBottom: SH(20),
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
