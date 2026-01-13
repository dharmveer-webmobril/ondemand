import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import React, { useMemo, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, CustomInput, CustomText, VectoreIcons, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryTabs from '@components/category/CategoryTabs';
import ServiceProviderListItem from '@components/category/ServiceProviderListItem';
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import { Category, useGetCategories, useGetServiceProviders, ServiceProvider } from '@services/api/queries/appQueries';
import imagePaths from '@assets';
import SCREEN_NAMES from '@navigation/ScreenNames';

type DeliveryMode = 'at_home' | 'online' | 'on_premises';

export default function CategoryProviders() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const routeCategory = (route.params as any)?.category as Category | undefined;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    routeCategory || null
  );
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('at_home');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProviders, setAllProviders] = useState<ServiceProvider[]>([]);

  // Get all categories for tabs
  const { data: categoriesData } = useGetCategories();
  const categories = useMemo(() => {
    return categoriesData?.ResponseData?.filter((cat: Category) => cat.status) || [];
  }, [categoriesData]);

  // Build categoryIds array - only include if category is selected
  const categoryIds = useMemo(() => {
    if (selectedCategory && selectedCategory._id) {
      return [selectedCategory._id];
    }
    return undefined; // Don't send key if no category
  }, [selectedCategory]);

  // Fetch providers with pagination
  const { 
    data: providersData, 
    isLoading: providersLoading, 
    isError: providersError,
    refetch: refetchProviders 
  } = useGetServiceProviders({
    page: currentPage,
    limit: 10,
    categoryIds,
  });

  // Accumulate providers from all pages
  React.useEffect(() => {
    if (providersData?.ResponseData) {
      if (currentPage === 1) {
        setAllProviders(providersData.ResponseData);
      } else {
        setAllProviders(prev => [...prev, ...providersData.ResponseData]);
      }
    }
  }, [providersData, currentPage]);

  // Reset providers when category changes
  React.useEffect(() => {
    setCurrentPage(1);
    setAllProviders([]);
  }, [selectedCategory?._id]);

  // Filter providers by search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) {
      return allProviders;
    }
    return allProviders.filter(
      (provider) =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.businessProfile?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.city?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProviders, searchQuery]);

  const hasMore = useMemo(() => {
    if (!providersData?.pagination) return false;
    return currentPage < providersData.pagination.pages;
  }, [providersData, currentPage]);

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

  return (
    <Container safeArea={false} style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>

        <View style={styles.searchContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <VectoreIcons
              icon="FontAwesome"
              name="angle-left"
              size={theme.SF(40)}
              color={theme.colors.text}
            />
          </Pressable>
          <View style={styles.searchInputContainer}>
            <CustomInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={imagePaths.Search}
            />
            {/* </View> */}
          </View>
        </View>
      </View>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedCategoryId={selectedCategory?._id || null}
        onSelectCategory={setSelectedCategory}
      />

      {/* Providers List */}
      {providersLoading && currentPage === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : providersError ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.errorText}>Failed to load providers</CustomText>
          <CustomButton
            title="Reload"
            onPress={() => {
              setCurrentPage(1);
              setAllProviders([]);
              refetchProviders();
            }}
            buttonStyle={styles.reloadButton}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.whitetext}
            paddingHorizontal={theme.SW(20)}
            marginTop={theme.SH(10)}
          />
        </View>
      ) : filteredProviders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>
            {searchQuery.trim() ? 'No providers found matching your search' : 'No providers available'}
          </CustomText>
          {!searchQuery.trim() && (
            <CustomButton
              title="Reload"
              onPress={() => {
                setCurrentPage(1);
                setAllProviders([]);
                refetchProviders();
              }}
              buttonStyle={styles.reloadButton}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.whitetext}
              paddingHorizontal={theme.SW(20)}
              marginTop={theme.SH(10)}
            />
          )}
        </View>
      ) : (
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
                <CustomText style={styles.loadMoreText}>Load More</CustomText>
              </Pressable>
            ) : null
          }
        />
      )}

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
    headerContainer: {
      backgroundColor: Colors.white,
      paddingBottom: SH(12),
    },
    searchContainer: {
      paddingHorizontal: SW(20),
      paddingTop: SH(8),
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(10),
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
    searchInputContainer: {
      flex: 1,
      borderRadius: SW(10),
      paddingHorizontal: SW(10),
      paddingVertical: SH(10),
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

