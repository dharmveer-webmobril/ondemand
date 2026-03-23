import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Container,
  AppHeader,
  CustomText,
  CustomButton,
} from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useAppSelector } from '@store/hooks';
import {
  useGetTopRatedAndTopOfferedServices,
  type FeaturedServiceItem,
  type FeaturedListType,
} from '@services/api/queries/appQueries';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import FeaturedServiceCard from '@components/home/FeaturedServiceCard';
import { SH } from '@utils/dimensions';
import { queryClient } from '@services/api';

const PAGE_LIMIT = 20;

export default function FeaturedServicesList() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const listType: FeaturedListType = route.params?.listType ?? 'topRated';

  const cityId = useAppSelector(state => state.app.userCity)?._id;
  const [page, setPage] = useState(1);
  const [allServices, setAllServices] = useState<FeaturedServiceItem[]>([]);

  const {
    data,
    isLoading,
    isFetching,
    isRefetching,
    isError,
  } = useGetTopRatedAndTopOfferedServices({
    cityId,
    page,
    limit: PAGE_LIMIT,
  });

  useEffect(() => {
    if (!data?.ResponseData) return;
    const batch =
      listType === 'topRated'
        ? data.ResponseData.topRatedServices ?? []
        : data.ResponseData.topOfferedServices ?? [];
    if (page === 1) {
      setAllServices(batch);
    } else {
      setAllServices(prev => {
        const ids = new Set(prev.map(s => s._id));
        const merged = [...prev];
        for (const s of batch) {
          if (!ids.has(s._id)) merged.push(s);
        }
        return merged;
      });
    }
  }, [data, page, listType]);

  const hasMore = useMemo(() => {
    if (!data?.ResponseData) return false;
    const batch =
      listType === 'topRated'
        ? data.ResponseData.topRatedServices ?? []
        : data.ResponseData.topOfferedServices ?? [];
    return batch.length >= PAGE_LIMIT;
  }, [data, listType]);

  const screenTitle =
    listType === 'topRated'
      ? t('home.topRatedServices')
      : t('home.topOfferedServices');

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

  const onRefresh = useCallback(async () => {
    setAllServices([]);
    setPage(1);
    await queryClient.resetQueries({
      queryKey: ['topRatedTopOfferedServices', cityId],
    });
  }, [cityId]);

  const loadMore = useCallback(() => {
    if (!hasMore || isFetching || isLoading) return;
    setPage(p => p + 1);
  }, [hasMore, isFetching, isLoading]);

  const listEmpty =
    !isLoading && !isFetching && allServices.length === 0 && !isError;

  return (
    <Container safeArea={false} style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader
          title={screenTitle}
          onLeftPress={() => navigation.goBack()}
          backgroundColor={theme.colors.white}
          tintColor={theme.colors.text}
        />
      </View>

      {!cityId ? (
        <View style={styles.centered}>
          <CustomText textAlign="center" color={theme.colors.gray}>
            {t('home.selectCityForServices')}
          </CustomText>
        </View>
      ) : isLoading && page === 1 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <CustomText textAlign="center" color={theme.colors.gray}>
            {t('home.failedToLoadFeatured')}
          </CustomText>
          <CustomButton
            title={t('category.retry')}
            onPress={() => {
              setAllServices([]);
              setPage(1);
              queryClient.resetQueries({
                queryKey: ['topRatedTopOfferedServices', cityId],
              });
            }}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.whitetext}
            marginTop={theme.SH(12)}
            buttonStyle={styles.retryBtn}
          />
        </View>
      ) : (
        <FlatList
          data={allServices}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={!!isRefetching && page === 1}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          ListEmptyComponent={
            listEmpty ? (
              <View style={styles.centered}>
                <CustomText textAlign="center" color={theme.colors.gray}>
                  {t('home.noFeaturedServices')}
                </CustomText>
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              <FeaturedServiceCard
                service={item}
                onPress={handlePressService}
                variant="grid"
              />
            </View>
          )}
        />
      )}
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    headerWrap: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(8),
    },
    listContent: {
      paddingHorizontal: theme.SW(16),
      paddingBottom: SH(100),
      paddingTop: theme.SH(8),
    },
    columnWrap: {
      justifyContent: 'space-between',
      marginBottom: theme.SH(12),
    },
    gridCell: {
      width: '48%',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.SW(24),
    },
    footerLoader: {
      paddingVertical: theme.SH(16),
    },
    retryBtn: {
      borderRadius: theme.SF(8),
    },
  });
