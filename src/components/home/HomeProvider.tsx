import { View, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@utils/theme';
import HomeProviderItem from './HomeProviderItem';
import { CustomText, CustomButton } from '@components/common';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';

type HomeProviderProps = {
  onViewAll?: () => void;
  providersData?: any;
  providersLoading?: boolean;
  providersError?: boolean;
  onRetryProviders?: () => void;
};

export default function HomeProvider({ onViewAll, providersData, providersLoading, providersError, onRetryProviders }: HomeProviderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  console.log('providersData', providersData);

  const providers = useMemo(() => {
    return providersData?.ResponseData || [];
  }, [providersData
    
  ]);

  const handleProviderPress = (provider: any) => {
    navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
      provider: {
        id: provider._id,
        name: provider.name,
        logo: provider.profileImage,
        address: provider.businessProfile?.address || provider.city?.name || '',
        serviceType: provider.businessProfile?.name || 'Service Provider',
        rating: typeof provider.rating === 'number' ? provider.rating : null,
        reviewCount: 0, // Add review count from API if available
      },
    });
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate(SCREEN_NAMES.CATEGORY_PROVIDERS);
    }
  };

  if (providersLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
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
    return (
      <View style={styles.emptyContainer}>
        <CustomText style={styles.emptyText}>{t('home.noProvidersAvailable')}</CustomText>
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
    <View style={styles.container}>
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
          <CustomText style={styles.viewAllText}>View All</CustomText>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (theme: any) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      marginTop: -SH(35),
    },
    listContent: {
      paddingHorizontal: SW(18),
      paddingRight: SW(20),
      marginVertical: SH(8),
      paddingTop: SH(15),
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
      paddingVertical: SH(40),
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
