import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors, SH, SW, Fonts, SF, boxShadowlight } from '../utils';
import { AppHeader, AppText, Container, HomeSearchBar, ImageLoader } from '../component';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGetCategoriesQuery } from '../redux';
import { Skeleton } from '../component/Skeleton';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
 
const RenderCategory = ({ item }: { item: any }) => {
  console.log('item?.label', item?.label);
  return (
    <View style={[styles.itemContainer, boxShadowlight]}>
      <View style={styles.imageContainer}>
        <ImageLoader
          source={{ uri: item?.categoryImage }}
          resizeMode="cover"
          mainImageStyle={styles.image}
        />
      </View>
      <AppText style={styles.text}>
        {item?.label ? item.label.trim().charAt(0).toUpperCase() + item.label.trim().slice(1) : ''}
      </AppText>
    </View>
  );
};

const SkeletonTwoColumnItem: React.FC = () => {
  return (
    <View style={[styles.itemContainer, styles.skeletonContainer, boxShadowlight]}>
      <Skeleton animation="wave" style={styles.skeletonImage} />
      <Skeleton animation="wave" style={styles.skeletonText} />
    </View>
  );
};

const CategoryList: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title } = route.params;
  const { t } = useTranslation();
  const { data: categoryData, isFetching, error, refetch } = useGetCategoriesQuery();

  const [searchTerm, setSearchTerm] = useState('');

  // Immediate state update on text change
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  // Debounced search handler (optional, for future API calls)
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        console.log('Debounced search term:', value);
      }, 300),
    []
  );

  // Filter data based on search term
  const filteredCategoryData = useMemo(() => {
    if (!categoryData) return [];
    return categoryData.filter((item) =>
      item?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryData, searchTerm]);

  useEffect(() => {
    refetch();
    return () => {
      debouncedSearch.cancel(); // Cleanup debounce on unmount
    };
  }, [refetch, debouncedSearch]);

  const showNoResults = searchTerm.length > 0 && filteredCategoryData.length === 0;

  return (
    <Container statusBarColor={Colors.white}>
      <AppHeader
        headerTitle={t('category.title', { defaultValue: title })}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={{ backgroundColor: Colors.bgwhite }}
        titleStyle={{ color: Colors.textHeader, fontSize: SF(18) }}
      />
      <View style={styles.searchContainer}>
        <HomeSearchBar
          showFilterIcon={false}
          onTextchange={handleSearchChange}
          value={searchTerm}
        />
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>
            {t('category.error', { defaultValue: 'Failed to load categories. Tap to retry.' })}
          </AppText>
          <Pressable onPress={refetch} style={styles.retryButton}>
            <AppText style={styles.retryText}>{t('category.retry', { defaultValue: 'Retry' })}</AppText>
          </Pressable>
        </View>
      ) : showNoResults ? (
        <View style={styles.noResultsContainer}>
          <AppText style={styles.noResultsText}>
            {t('category.noResults', { defaultValue: `No results found for ${searchTerm}. Try something different!` })}
          </AppText>
          <AppText style={styles.goodMsg}>
            {t('category.goodMsg', { defaultValue: 'Keep exploring, you’ll find something great!' })}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={isFetching ? Array(6).fill({}) : filteredCategoryData}
          renderItem={({ item }) => (isFetching ? <SkeletonTwoColumnItem /> : <RenderCategory item={item} />)}
          keyExtractor={(item, index) => (isFetching ? `skeleton-${index}` : `${item?._id?.toString()}-${title}`)}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          removeClippedSubviews={false}
          ListEmptyComponent={
            !isFetching && !showNoResults && categoryData?.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>
                  {t('category.empty', { defaultValue: 'No categories available.' })}
                </AppText>
              </View>
            ) : null
          }
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SH(20),
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SH(20),
    backgroundColor: Colors.themelight,
    borderRadius: SW(10),
    paddingBottom: SH(10),
  },
  imageContainer: {
    width: '100%',
    height: SH(110),
    borderRadius: SW(10),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: SH(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
  },
  skeletonContainer: {
    backgroundColor: Colors.themelight,
  },
  skeletonImage: {
    width: '100%',
    height: SH(110),
    borderRadius: SW(10),
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: SF(18),
    width: '80%',
    marginTop: SH(10),
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  errorContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  searchContainer: {
    alignSelf: 'center',
    marginHorizontal: SW(20),
    marginTop: SH(5),
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SH(20),
  },
  noResultsText: {
    fontSize: SF(16),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    textAlign: 'center',
  },
  goodMsg: {
    fontSize: SF(14),
    fontFamily: Fonts.REGULAR,
    color: Colors.gray1,
    textAlign: 'center',
    marginTop: SH(10),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SH(20),
  },
  emptyText: {
    fontSize: SF(16),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    textAlign: 'center',
  },
});

export default CategoryList;