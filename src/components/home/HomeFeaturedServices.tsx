import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import FeaturedServiceCard from './FeaturedServiceCard';
import HomeFeaturedServicesSkeleton from './HomeFeaturedServicesSkeleton';
import type {
  FeaturedServiceItem,
  FeaturedListType,
} from '@services/api/queries/appQueries';
import { HOME_HORIZONTAL_PADDING } from './homeLayout';

type HomeFeaturedServicesProps = {
  title: string;
  /** When set and services are empty, show location hint instead of hiding the section */
  cityName?: string;
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
  cityName = '',
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
    navigate(SCREEN_NAMES.SERVICE_DETAIL, {
      service,
      provider: service.provider,
    });
  }, []);

  const showLocationEmpty =
    !!cityName.trim() &&
    !isLoading &&
    !isError &&
    data.length === 0;

  if (!isLoading && !isError && data.length === 0 && !showLocationEmpty) {
    return null;
  }

  const emptyLocationContent = showLocationEmpty ? (
    <View style={styles.locationEmptyBox}>
      <CustomText
        color={theme.colors.text}
        fontSize={theme.fontSize.lg}
        fontFamily={theme.fonts.SEMI_BOLD}
        textAlign="center"
      >
        {t('home.noDataForLocationTitle')}
      </CustomText>
      <CustomText
        color={theme.colors.lightText || theme.colors.gray}
        fontSize={theme.fontSize.sm}
        fontFamily={theme.fonts.REGULAR}
        textAlign="center"
        marginTop={theme.SH(8)}
      >
        {t('home.noDataForLocationHint')}
      </CustomText>
    </View>
  ) : null;

  return (
    <View style={styles.section}>
      <View style={[styles.headerRow, styles.sectionHeader]}>
        <CustomText
          color={theme.colors.text}
          fontSize={theme.fontSize.lg}
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
        <HomeFeaturedServicesSkeleton />
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
      ) : showLocationEmpty ? (
        emptyLocationContent
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={item => item._id}
          renderItem={({ item, index }) => (
            <FeaturedServiceCard
              service={item}
              index={index}
              onPress={handlePressService}
              variant="carousel"
              listType={listType}
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
      paddingHorizontal: theme.SW(HOME_HORIZONTAL_PADDING),
      marginBottom: theme.SH(10),
    },
    viewAllText: {
      textDecorationLine: 'underline',
    },
    listContent: {
      paddingHorizontal: theme.SW(HOME_HORIZONTAL_PADDING),
      paddingBottom: theme.SH(4),
    },
    loader: {
      paddingVertical: theme.SH(24),
      alignItems: 'center',
    },
    errorBox: {
      paddingHorizontal: theme.SW(HOME_HORIZONTAL_PADDING),
      paddingVertical: theme.SH(16),
      alignItems: 'center',
    },
    retryBtn: {
      borderRadius: theme.SF(8),
    },
    locationEmptyBox: {
      marginHorizontal: theme.SW(HOME_HORIZONTAL_PADDING),
      paddingVertical: theme.SH(18),
      paddingHorizontal: theme.SW(14),
      borderRadius: theme.SF(12),
      backgroundColor: theme.colors.secondary || '#E8F4FD',
      borderWidth: 1,
      borderColor: theme.colors.primary || '#009BFF',
    },
  });
