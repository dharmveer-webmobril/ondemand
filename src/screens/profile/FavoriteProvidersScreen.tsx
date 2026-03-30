import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Container,
  AppHeader,
  CustomText,
  CustomButton,
} from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import HomeProviderItem from '@components/home/HomeProviderItem';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  useGetFavoriteServiceProviders,
  type ServiceProvider,
} from '@services/api/queries/appQueries';
import { formatAddress } from '@utils/tools';
import { queryClient } from '@services/api';
import { SH } from '@utils/dimensions';

export default function FavoriteProvidersScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {
    data: providers = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetFavoriteServiceProviders();

  const onRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['favoriteServiceProviders'] });
    await refetch();
  }, [refetch]);

  const handlePressProvider = useCallback((provider: ServiceProvider) => {
    navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
      provider: {
        id: provider._id,
        name: provider.name,
        logo: provider.profileImage,
        address:
          formatAddress({
            line1: provider.businessProfile?.line1,
            line2: provider.businessProfile?.line2,
            landmark: provider.businessProfile?.landmark,
            pincode: provider.businessProfile?.pincode,
            city: provider.businessProfile?.city?.name,
            country: provider.businessProfile?.country?.name,
          }) || provider.city?.name || '',
        serviceType:
          provider.businessProfile?.name ||
          t('providerDetails.serviceProviderDefault'),
        rating: typeof provider.rating === 'number' ? provider.rating : null,
        reviewCount: 0,
      },
      prevScreenFlag: 'without_data',
    });
  }, [t]);

  const listEmpty = !isLoading && !isFetching && providers.length === 0;

  return (
    <Container safeArea={false} style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top,paddingHorizontal:20 }]}>
        <AppHeader
          title={t('favoriteProviders.title')}
          onLeftPress={() => navigation.goBack()}
          backgroundColor={theme.colors.white}
          tintColor={theme.colors.text}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <CustomText textAlign="center" color={theme.colors.gray}>
            {t('favoriteProviders.loadError')}
          </CustomText>
          <CustomButton
            title={t('category.retry')}
            onPress={() =>
              queryClient.invalidateQueries({
                queryKey: ['favoriteServiceProviders'],
              })
            }
            buttonStyle={styles.retryBtn}
          />
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <HomeProviderItem
              layout="list"
              provider={item}
              onPress={() => handlePressProvider(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary || '#135D96']}
            />
          }
          ListEmptyComponent={
            listEmpty ? (
              <View style={styles.emptyWrap}>
                <CustomText style={styles.emptyTitle}>
                  {t('favoriteProviders.emptyTitle')}
                </CustomText>
                <CustomText style={styles.emptySubtitle}>
                  {t('favoriteProviders.emptySubtitle')}
                </CustomText>
              </View>
            ) : null
          }
        />
      )}
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
    },
    headerWrap: {
      backgroundColor: theme.colors.white,
    },
    listContent: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(16),
      paddingBottom: SH(32),
      flexGrow: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.SW(24),
      gap: theme.SH(16),
    },
    retryBtn: {
      marginTop: theme.SH(8),
    },
    emptyWrap: {
      paddingTop: theme.SH(48),
      paddingHorizontal: theme.SW(16),
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: theme.SF(16),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(8),
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || theme.colors.gray,
      textAlign: 'center',
      lineHeight: theme.SF(20),
    },
  });
