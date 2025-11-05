import React, { memo, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { Colors, Fonts, imagePaths, navigate, SF, SH, SW } from '../../utils';
import ImageLoader from '../ImageLoader';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import Spacing from '../Spacing';
import AppText from '../AppText';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery } from '../../redux';
import HomeSubContainerHeader from './HomeSubContainerHeader';
import Buttons from '../Button';
import Shimmer from '../Shimmer';

const SeparatorComponent = () => <Spacing horizontal space={SF(12)} />;

const SkeletonHomeCategoryItem = memo(() => (
  <View style={styles.skeletonContainer}>
    <Shimmer style={styles.skeletonImage} />
    <Shimmer style={styles.skeletonText} />
  </View>
));

const HomeCategoryItem = memo(({ name, image, catId, subCat }: any) => {
  const navigation = useNavigation<any>();
  return (
    <Pressable
      onPress={() => navigation.navigate(RouteName.SHOP_LIST, { subCats: subCat || [], catId, catName: name })}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.imageLoader}>
        <ImageLoader
          source={image ? { uri: image } : imagePaths.no_image}
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






const HomeCategory = memo(({ categoryData, isLoading, isError }: { categoryData: any, isLoading: boolean, isError: boolean }) => {

  const { t } = useTranslation();
 
  return (
    <>
      <HomeSubContainerHeader
        rightText={t('home.categoryViewAll')}
        marginHori={'7%'}
        leftText={t('home.browseCategories')}
        onClick={() => {
          !isLoading && !isError && navigate(RouteName.CATEGORY_LIST, {
            title: t('home.allCategories'),
            type: 'category',
          })
        }
        }
      />

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={isLoading ? [1231, 234, 567, 23, 1343] : categoryData}
          renderItem={({ item, index }) => {
            return isLoading ? <SkeletonHomeCategoryItem /> : <HomeCategoryItem
              key={`homecategory-${item?._id ?? index}`}
              id={item._id}
              name={item.label}
              image={item.categoryImage}
              subCat={item?.category?.subcategories || []}
              catId={item?.value}
            />
          }}
          keyExtractor={(item, index) => `category-${item?._id ?? index}`}
          contentContainerStyle={[
            styles.flatListContainer,
            (isError || isLoading) && styles.fullWidth,
          ]}
          ItemSeparatorComponent={SeparatorComponent}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>
                  {isError ? 'Error found' : "No shops found"}
                </AppText>
              </View>
            ) : null
          }
        />
      </View>
    </>
  );
});

export default HomeCategory;

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
    marginVertical: SH(5),
  },
  skeletonImage: {
    height: SF(58),
    width: SF(58),
    borderRadius: SF(58) / 2,
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: SF(12),
    width: SW(80),
    marginTop: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  errorContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginLeft: '7%',
  },
  errorText: {
    color: Colors.red,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
    width: '100%',
  },

  retryButton: {
    padding: SW(10),
    backgroundColor: Colors.themeColor,
    borderRadius: SF(8),
    marginTop: SH(10),
    width: '50%',
    height: SH(40),
    marginHorizontal: 5
  },

  retrybuttontext: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textWhite,
    textAlign: 'center'
  },
  viewalltext: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textWhite,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SF(70),
    width: '100%',
  },
  emptyText: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
    width: '100%',
  },
  categoryContainer: {
    marginRight: '7%',
    marginLeft: '6.5%',
    marginTop: 20,
  },
  fullWidth: {
    width: '100%',
  },
});