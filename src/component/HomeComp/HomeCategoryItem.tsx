import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import React, { memo, useEffect, useMemo } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import ImageLoader from '../ImageLoader';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import Spacing from '../Spacing';
import AppText from '../AppText';
import { useGetCategoriesQuery } from '../../redux';
import { Skeleton } from '../Skeleton';
import { useTranslation } from 'react-i18next';

interface HomeCategoryItemProps {
  name: string;
  image: any;
  id: string | number;
}

interface HomeCategoryProps {
  categoryData: HomeCategoryItemProps[];
  isLoading: boolean;
}

const SeparatorComponent = () => <Spacing horizontal space={SF(12)} />;

const HomeCategoryItem: React.FC<HomeCategoryItemProps> = memo(({ name, image }) => {
  console.log('imageimageimage', image);

  const navigation = useNavigation<any>();
  return (
    <Pressable
      onPress={() => navigation.navigate(RouteName.SHOP_LIST)}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.imageLoader}>
        <ImageLoader
          source={image}
          resizeMode="cover"
          mainImageStyle={styles.mainImage}
        />
      </View>
      <AppText style={styles.text} numberOfLines={2}>
        {name ? name.trim().charAt(0).toUpperCase() + name.trim().slice(1) : ''}
      </AppText>
    </Pressable>
  );
});

const SkeletonHomeCategoryItem: React.FC = memo(() => {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton style={styles.skeletonImage} />
      <Skeleton style={styles.skeletonText} />
    </View>
  );
});

const HomeCategory: React.FC<HomeCategoryProps> = memo(() => {
  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError, refetch: refetchCategory } = useGetCategoriesQuery();
  const { t } = useTranslation();

  const memoizedCategoryData = useMemo(() => categoryData || [], [categoryData]);
  useEffect(() => {
    refetchCategory();
  }, [refetchCategory]);

  const renderItem = ({ item }: { item: any }) => {
    console.log('iteemmm', item);
    return <HomeCategoryItem id={item._id} name={item.label} image={{ uri: item.categoryImage }} />;
  };
  const renderSkeleton = () => <SkeletonHomeCategoryItem />;

  // Determine the display state
  if (categoryError) {
    return (
      <View style={styles.errorContainer}>
        <AppText style={styles.errorText}>
          {t('homeCategory.error', { defaultValue: 'Failed to load categories. Tap to retry.' })}
        </AppText>
        <Pressable onPress={refetchCategory} style={styles.retryButton}>
          <AppText style={styles.retryText}>{t('homeCategory.retry', { defaultValue: 'Retry' })}</AppText>
        </Pressable>
      </View>
    );
  }

  if (memoizedCategoryData.length === 0 && !isCategoryLoading) {
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.emptyText}>{t('homeCategory.empty', { defaultValue: 'Category is empty' })}</AppText>
      </View>
    );
  }

  return (
    <>
      <FlatList
        horizontal
        data={isCategoryLoading ? Array(6).fill({}) : memoizedCategoryData}
        ItemSeparatorComponent={SeparatorComponent}
        keyExtractor={(item, index) => (isCategoryLoading ? `skeleton-${index}` : `${item.name}-cat-${index}`)}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (isCategoryLoading ? renderSkeleton() : renderItem({ item }))}
        contentContainerStyle={styles.flatListContainer}
      />
    </>
  );
});

export default React.memo(HomeCategory);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageLoader: {
    height: SF(58),
    width: SF(58),
    borderRadius: SF(58) / 2,
    borderWidth: 1,
    borderColor: Colors.themeColor,
    overflow: 'hidden',
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginTop: 5,
    maxWidth: SW(80),
    textAlign: 'center',
  },
  flatListContainer: {
    paddingLeft: 6,
  },
  skeletonContainer: {
    alignItems: 'center',
  },
  skeletonImage: {
    height: SF(56),
    width: SF(56),
    borderRadius: SF(56) / 2,
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: SF(14),
    width: SW(80),
    marginTop: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  errorContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.red,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
  },
  retryButton: {
    padding: SW(10),
    backgroundColor: Colors.themeColor,
    borderRadius: SF(8),
    marginTop: SH(10),
  },
  retryText: {
    color: Colors.textWhite,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SF(70), // Minimum height to match category item height
  },
  emptyText: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
  },
});