import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import HomeSlider from './HomeSlider';
import HomeCategoryList from './HomeCategoryList';
import HomeProvider from './HomeProvider';
import { CustomText, Spacing } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  CategoriesResponse,
  BannersResponse,
  TopRatedTopOfferedResponse,
} from '@services/api/queries/appQueries';
import HomeFeaturedServices from './HomeFeaturedServices';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { SH } from '@utils/dimensions';

type HomeMainListProps = {
  refreshing?: boolean;
  onRefresh?: () => void;
  categoriesData?: CategoriesResponse;
  categoriesLoading?: boolean;
  categoriesError?: boolean;
  onRetryCategories?: () => void;
  bannersData?: BannersResponse;
  bannersLoading?: boolean;
  bannersError?: boolean;
  onRetryBanners?: () => void;
  providersData?: any;
  providersLoading?: boolean;
  providersError?: boolean;
  onRetryProviders?: () => void;
  featuredData?: TopRatedTopOfferedResponse;
  featuredLoading?: boolean;
  featuredError?: boolean;
  onRetryFeatured?: () => void;
};

export default function HomeMainList({
  refreshing = false,
  onRefresh,
  categoriesData,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  bannersData,
  bannersLoading,
  bannersError,
  onRetryBanners,
  providersData,
  providersLoading,
  providersError,
  onRetryProviders,
  featuredData,
  featuredLoading,
  featuredError,
  onRetryFeatured,
}: HomeMainListProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const handleViewAll = useCallback((sectionKey: string) => {
    if (sectionKey === 'Categories') {
      navigate(SCREEN_NAMES.CATEGORY_LIST);
    } else if (sectionKey === 'provider') {
      navigate(SCREEN_NAMES.CATEGORY_PROVIDERS);
    } else {
      console.log('View All pressed for:', sectionKey);
    }
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary || '#135D96']}
        />
      }
    >
      <Spacing space={20} />
      <HomeSlider
        banners={bannersData?.ResponseData || []}
        isLoading={bannersLoading}
        isError={bannersError}
        onRetry={onRetryBanners}
      />

      <Spacing space={20} />

      <View style={[styles.headerContainer, styles.sectionHeader]}>
        <CustomText
          color={theme.colors.text}
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.BOLD}
        >
          {t('home.categories')}
        </CustomText>
        <CustomText
          color={theme.colors.primary || '#135D96'}
          style={styles.viewAllText}
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.SEMI_BOLD}
          onPress={() => handleViewAll('Categories')}
        >
          View All
        </CustomText>
      </View>
      <HomeCategoryList
        categories={categoriesData?.ResponseData || []}
        isLoading={categoriesLoading}
        isError={categoriesError}
        onRetry={onRetryCategories}
      />

      {/* <View style={styles.sectionSpacer} /> */}
      <Spacing space={10} />
      <HomeFeaturedServices
        title={t('home.featuredServicesAds')}
        services={
          featuredData?.ResponseData?.topRatedServices?.slice(0, 15) ?? []
        }
        isLoading={!!featuredLoading}
        isError={!!featuredError}
        onRetry={onRetryFeatured}
        listType="topRated"
        maxItems={15}
      />

   
      <Spacing space={10} />

      <View style={[styles.headerContainer, styles.sectionHeader]}>
        <CustomText
          color={theme.colors.text}
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.BOLD}
        >
          {t('home.nearestProvider')}
        </CustomText>
        <CustomText
          color={theme.colors.primary || '#135D96'}
          style={styles.viewAllText}
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.SEMI_BOLD}
          onPress={() => handleViewAll('provider')}
        >
          View All
        </CustomText>
      </View>
      <HomeProvider
        providersData={providersData}
        providersLoading={providersLoading}
        providersError={providersError}
        onRetryProviders={onRetryProviders}
      />
    </ScrollView>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: SH(90),
    },
    sectionSpacer: {
      height: theme.SH(20),
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionHeader: {
      paddingHorizontal: theme.SW(16),
    },
    viewAllText: {
      textDecorationLine: 'underline',
    },
  });
