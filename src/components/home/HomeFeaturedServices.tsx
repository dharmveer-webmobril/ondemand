import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import FeaturedServiceCard from './FeaturedServiceCard';
import type {
  FeaturedServiceItem,
  FeaturedListType,
} from '@services/api/queries/appQueries';

type HomeFeaturedServicesProps = {
  title: string;
  services: FeaturedServiceItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  listType: FeaturedListType;
  /** Max items to show in horizontal list (home uses 15) */
  maxItems?: number;
};

const Separator = () => {
  const theme = useThemeContext();
  return <View style={{ width: theme.SW(12) }} />;
};

export default function HomeFeaturedServices({
  title,
  services,
  isLoading = false,
  isError = false,
  onRetry,
  listType,
  maxItems = 15,
}: HomeFeaturedServicesProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const data = useMemo(
    () => services.slice(0, maxItems),
    [services, maxItems],
  );

  const handleViewAll = useCallback(() => {
    navigate(SCREEN_NAMES.FEATURED_SERVICES_LIST, { listType });
  }, [listType]);

  const handlePressService = useCallback((service: FeaturedServiceItem) => {
    navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
      provider: {
        id: service.provider?._id || service.sp_id,
        name: service.provider?.name,
        logo: service.provider?.profileImage,
        address: '',
        serviceType: service.name,
        rating:
          typeof service.averageRating === 'number'
            ? service.averageRating
            : null,
        reviewCount: service.ratingCount ?? 0,
      },
      prevScreenFlag: 'without_data',
    });
  }, []);

  if (!isLoading && !isError && data.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={[styles.headerRow, styles.sectionHeader]}>
        <CustomText
          color={theme.colors.text}
          fontSize={theme.fontSize.md}
          fontFamily={theme.fonts.BOLD}
        >
          {title}
        </CustomText>
        <CustomText
          color={theme.colors.primary || '#135D96'}
          style={styles.viewAllText}
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.SEMI_BOLD}
          onPress={handleViewAll}
        >
          {t('home.categoryViewAll')}
        </CustomText>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.errorBox}>
          <CustomText
            color={theme.colors.gray || '#666'}
            fontSize={theme.fontSize.sm}
            textAlign="center"
          >
            {t('home.failedToLoadFeatured')}
          </CustomText>
          {onRetry ? (
            <CustomButton
              title={t('category.retry')}
              onPress={onRetry}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.whitetext}
              paddingHorizontal={theme.SW(20)}
              marginTop={theme.SH(8)}
              buttonStyle={styles.retryBtn}
            />
          ) : null}
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <FeaturedServiceCard
              service={item}
              onPress={handlePressService}
              variant="carousel"
            />
          )}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.SH(8),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionHeader: {
      paddingHorizontal: theme.SW(16),
      marginBottom: theme.SH(10),
    },
    viewAllText: {
      textDecorationLine: 'underline',
    },
    listContent: {
      paddingHorizontal: theme.SW(16),
      paddingBottom: theme.SH(4),
    },
    loader: {
      paddingVertical: theme.SH(24),
      alignItems: 'center',
    },
    errorBox: {
      paddingHorizontal: theme.SW(16),
      paddingVertical: theme.SH(16),
      alignItems: 'center',
    },
    retryBtn: {
      borderRadius: theme.SF(8),
    },
  });
