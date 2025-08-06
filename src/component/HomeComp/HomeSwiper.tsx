import { View, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useMemo, useEffect, useState } from 'react';
import { boxShadowlight, Colors, Fonts, SF, SW } from '../../utils';
import Swiper from 'react-native-swiper';
import ImageLoader from '../ImageLoader';
import { useGetHomeBannerQuery } from '../../redux';
import AppText from '../AppText'; // Assuming a custom text component for error
import { useTranslation } from 'react-i18next';

const HomeSwiper: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetHomeBannerQuery();
  const { t } = useTranslation();
  const [hasFetched, setHasFetched] = useState(false); // Track if API has been called at least once

  useEffect(() => {
    refetch(); // Trigger the initial API call
    setHasFetched(true); // Mark as fetched after the first call
  }, [refetch]);

  const bannerData = useMemo(() => {
    if (data?.success && data.data?.length > 0) {
      return data.data
        .filter((item: any) => item.title === 'user') // Filter for title === 'user'
        .flatMap((item: any) =>
          item.images.map((imgUrl: string, index: number) => ({
            id: index,
            imgUrl,
            title: item.title, // "user"
          }))
        );
    }
    return [];
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.themeColor} />
      </View>
    );
  }

  if (hasFetched && !isLoading && (error || !data?.success)) {
    return (
      <View style={styles.errorContainer}>
        <AppText style={styles.errorText}>
          {t('homeSwiper.error', { defaultValue: data?.message || 'Failed to load banners. Please try again later.' })}
        </AppText>
      </View>
    );
  }

  if (bannerData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.emptyText}>{t('homeSwiper.empty', { defaultValue: 'Banner is empty' })}</AppText>
      </View>
    );
  }

  return (
    <Swiper
      showsButtons={false}
      style={styles.wrapper}
      pagingEnabled={true}
      autoplay
      dot={<View style={styles.dot} />}
      activeDot={<View style={styles.activeDot} />}
      paginationStyle={styles.paginationStyle}
    >
      {bannerData.map((item: { id: number; imgUrl: string; title: string }) => (
        <View style={[styles.slide]} key={item.id}>
          <View style={[styles.imageBox, boxShadowlight]}>
            <ImageLoader
              resizeMode="contain"
              mainImageStyle={styles.image}
              source={{ uri: item.imgUrl }}
            />
          </View>
        </View>
      ))}
    </Swiper>
  );
};

export default React.memo(HomeSwiper);

const styles = StyleSheet.create({
  wrapper: {
    height: SF(160),
  },
  dot: {
    backgroundColor: Colors.gray1,
    width: SF(10),
    height: SF(10),
    borderRadius: SF(10) / 2,
    marginLeft: SF(3),
    marginRight: SF(3),
    marginBottom: -SF(35),
  },
  activeDot: {
    backgroundColor: Colors.themeColor,
    width: SF(10),
    height: SF(10),
    borderRadius: SF(10) / 2,
    marginLeft: SF(3),
    marginRight: SF(3),
    marginBottom: -SF(35),
  },
  paginationStyle: {
    bottom: 0,
  },
  slide: {
    height: SF(160),
    borderRadius: SF(10),
    paddingHorizontal: '7%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageBox: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginVertical: 2,
  },
  loaderContainer: {
    height: SF(160),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: SF(10),
  },
  errorContainer: {
    height: SF(160),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: SF(10),
    paddingHorizontal: SW(15),
  },
  errorText: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.red,
    textAlign: 'center',
  },
  emptyContainer: {
    height: SF(160),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: SF(10),
    paddingHorizontal: SW(15),
  },
  emptyText: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    textAlign: 'center',
  },
});