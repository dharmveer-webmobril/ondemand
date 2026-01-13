import { View, SectionList, StyleSheet, RefreshControl } from 'react-native';
import React, { useMemo } from 'react';
import HomeSlider from './HomeSlider';
import HomeCategoryList from './HomeCategoryList';
import HomeProvider from './HomeProvider';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CategoriesResponse, BannersResponse } from '@services/api/queries/appQueries';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';

type SectionData = {
  title: string;
  data: any[];
  key: string;
  renderItem: () => React.ReactElement;
};

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
};

const SectionSeparator = () => {
  const theme = useThemeContext();
  const styles = useMemo(() => StyleSheet.create({
    separator: {
      height: theme.SH(30),
    },
  }), [theme]);
  return <View style={styles.separator} />;
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
}: HomeMainListProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleViewAll = (sectionKey: string) => {
    if (sectionKey === 'provider') {
      // Navigate to CategoryProviders without category filter
      navigate(SCREEN_NAMES.CATEGORY_PROVIDERS);
    } else {
      console.log('View All pressed for:', sectionKey);
    }
  };

  const DATA: SectionData[] = useMemo(() => [
    {
      title: '',
      data: [{}],
      key: 'slider',
      renderItem: () => (
        <HomeSlider 
          banners={bannersData?.ResponseData || []}
          isLoading={bannersLoading}
          isError={bannersError}
          onRetry={onRetryBanners}
        />
      ),
    },
    {
      title: 'Categories',
      renderItem: () => (
        <HomeCategoryList 
          categories={categoriesData?.ResponseData || []}
          isLoading={categoriesLoading}
          isError={categoriesError}
          onRetry={onRetryCategories}
        />
      ),
      key: 'Categories',
      data: [{}],
    },
    {
      title: 'Nearest Provider',
      key: 'provider',
      data: [{}],
      renderItem: () => <HomeProvider />,
    },
  ], [bannersData, bannersLoading, bannersError, onRetryBanners, categoriesData, categoriesLoading, categoriesError, onRetryCategories]);

  return (
    <SectionList
      sections={DATA}
      keyExtractor={(_, index) => index?.toString()}
      renderItem={({ _, section }: any) => section.renderItem()}
      renderSectionHeader={({ section: { title, key } }) =>
        title ? (
          <View style={[styles.headerContainer, styles.sectionHeader]}>
            <CustomText
              color={theme.colors.text}
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.SEMI_BOLD}
            >
              {title}
            </CustomText>
            <CustomText
              color={theme.colors.primary || '#135D96'}
              style={styles.viewAllText}
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.SEMI_BOLD}
              onPress={() => handleViewAll(key)}
            >
              View All
            </CustomText>
          </View>
        ) : null
      }
      SectionSeparatorComponent={SectionSeparator}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary || '#135D96']}
        />
      }
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
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
    sectionSeparator: {
      // height: theme.SH(20),
    },
    contentContainer: {
      paddingBottom: theme.SH(90),
    },
  });