import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@utils/theme';
import HomeProviderItem from './HomeProviderItem';
import { CustomText, CustomButton } from '@components/common';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import HomeProviderSkeleton from './HomeProviderSkeleton';
import { formatAddress, getProviderDisplayName } from '@utils/tools';

type HomeProviderProps = {
  onViewAll?: () => void;
  providersData?: any;
  providersLoading?: boolean;
  providersError?: boolean;
  onRetryProviders?: () => void;
  /** When set and provider list is empty, show location-specific empty copy */
  cityName?: string;
};

export default function HomeProvider({ onViewAll, providersData, providersLoading, providersError, onRetryProviders, cityName = '' }: HomeProviderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const providers = useMemo(() => {
    return providersData?.ResponseData || [];
  }, [providersData]);

  const handleProviderPress = (provider: any) => {
  
    navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
      provider: {
        id: provider._id,
        name: getProviderDisplayName(provider, t('home.providerFallbackName')),
        logo: provider.profileImage,
        address: formatAddress({ line1: provider.businessProfile?.line1, line2: provider.businessProfile?.line2, landmark: provider.businessProfile?.landmark, pincode: provider.businessProfile?.pincode, city: provider.businessProfile?.city?.name, country: provider.businessProfile?.country?.name }) || provider.city?.name || '',
        serviceType: provider.cityName || provider.businessProfile?.cityName || '',
        rating: typeof provider.rating === 'number' ? provider.rating : null,
        reviewCount: 0, // Add review count from API if available
      },
      prevScreenFlag: 'without_data',
    });
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, { resetSession: true });
    }
  };

  if (providersLoading) {
    return <HomeProviderSkeleton />;
  }

  if (providersError) {
    return (
      <View style={styles.errorContainer}>
        <CustomText style={styles.errorText}>{t('home.failedToLoadProviders')}</CustomText>
        <CustomButton
          title={t('category.reload')}
          onPress={() => onRetryProviders?.()}
          buttonStyle={styles.reloadButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
          paddingHorizontal={theme.SW(20)}
          marginTop={theme.SH(10)}
        />
      </View>
    );
  }

  if (providers.length === 0) {
    const locationAware = !!cityName.trim();
    return (
      <View style={styles.emptyContainer}>
        {locationAware ? (
          <>
            <CustomText style={styles.locationEmptyTitle}>
              {t('home.noDataForLocationTitle')}
            </CustomText>
            <CustomText style={styles.locationEmptyHint}>
              {t('home.noDataForLocationHint')}
            </CustomText>
          </>
        ) : (
          <CustomText style={styles.emptyText}>{t('home.noProvidersAvailable')}</CustomText>
        )}
        <CustomButton
          title={t('category.reload')}
          onPress={() => onRetryProviders?.()}
          buttonStyle={styles.reloadButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
          paddingHorizontal={theme.SW(20)}
          marginTop={theme.SH(10)}
        />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={providers}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <HomeProviderItem
            provider={item}
            onPress={() => handleProviderPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      {(providersData?.pagination?.total ?? 0) > 10 && (
        <Pressable
          onPress={handleViewAll}
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <CustomText style={styles.viewAllText}>
            {t('home.categoryViewAll')}
          </CustomText>
        </Pressable>
      )}
    </>
  );
}

const createStyles = (theme: any) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
  
    listContent: {
      paddingHorizontal: SW(18),
      paddingRight: SW(20),
      marginVertical: SH(8),
    },
    loaderContainer: {
      paddingVertical: SH(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorContainer: {
      paddingVertical: SH(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      paddingVertical: SH(24),
      paddingHorizontal: SW(16),
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.red || '#FF0000',
      textAlign: 'center',
      marginBottom: SH(10),
    },
    emptyText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      textAlign: 'center',
      marginBottom: SH(10),
    },
    locationEmptyTitle: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      textAlign: 'center',
      marginBottom: SH(8),
    },
    locationEmptyHint: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.gray,
      textAlign: 'center',
      lineHeight: SH(20),
    },
    reloadButton: {
      borderRadius: SF(8),
    },
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: SH(12),
      marginTop: SH(10),
    },
    viewAllText: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
      textDecorationLine: 'underline',
    },
  });
};
