import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AnimatedPressable, Container, CustomInput, CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Category, useGetCategories } from '@services/api/queries/appQueries';
import imagePaths from '@assets';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { navigate } from '@utils/NavigationUtils';
import VectoreIcons from '@components/common/VectoreIcons';
import ImageLoader from '@components/common/ImageLoader';
import CustomButton from '@components/common/CustomButton';

const CategoryItem = memo(function CategoryItem({
  category,
  onPress,
}: {
  category: Category;
  onPress: (category: Category) => void;
}) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = useCallback(() => onPress(category), [category, onPress]);

  const displayName = category.name
    ? category.name.trim().charAt(0).toUpperCase() + category.name.trim().slice(1)
    : '';

  return (
    <AnimatedPressable onPress={handlePress} style={styles.itemWrapper}>
      <View style={styles.card}>
        <View style={styles.coverImageLoader}>
          <ImageLoader
            source={category.image ? { uri: category.image } : imagePaths.no_image}
            resizeMode="cover"
            mainImageStyle={styles.coverMainImage}
          />
        </View>
        <CustomText style={styles.itemText} numberOfLines={2}>
          {displayName}
        </CustomText>
      </View>
    </AnimatedPressable>
  );
});

export default function CategoryList() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { data: categoriesData, isLoading, isError, refetch } = useGetCategories();

  const [searchQuery, setSearchQuery] = useState('');

  const activeCategories = useMemo(() => {
    return categoriesData?.ResponseData?.filter((cat: Category) => cat.status) || [];
  }, [categoriesData]);

  const search = searchQuery.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!search) return activeCategories;
    return activeCategories.filter((cat) =>
      (cat.name || '').toLowerCase().includes(search),
    );
  }, [activeCategories, search]);

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  const handleCategoryPress = useCallback((category: Category) => {
    navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, {
      category,
      resetSession: true,
    });
  }, []);

  return (
    <Container safeArea animate={false} style={styles.container}>
      <View style={styles.searchContainer}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <VectoreIcons
            icon="FontAwesome"
            name="angle-left"
            size={theme.SF(40)}
            color={theme.colors.text}
          />
        </AnimatedPressable>

        <View style={styles.searchInputWrapper}>
          <CustomInput
            placeholder={t('category.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={imagePaths.Search}
            rightIcon={searchQuery.length > 0 ? imagePaths.remove : null}
            onRightIconPress={handleClearSearch}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText}>{t('home.failedToLoadCategories')}</CustomText>
          <CustomButton
            title={t('category.retry')}
            onPress={() => refetch()}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.whitetext}
            paddingHorizontal={theme.SW(20)}
            marginTop={theme.SH(10)}
            buttonStyle={styles.reloadButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CategoryItem category={item} onPress={handleCategoryPress} />
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>
                {search
                  ? t('category.noResults', { searchTerm: searchQuery.trim() })
                  : t('category.empty')}
              </CustomText>
            </View>
          }
        />
      )}
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  const columnGap = SW(12);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background || '#F5F5F5',
    },
    backButton: {
      padding: SW(10),
    },
    searchContainer: {
      paddingHorizontal: SW(16),
      paddingVertical: SH(10),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white || '#FFFFFF',
    },
    searchInputWrapper: {
      flex: 1,
      marginLeft: SW(8),
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
    },
    errorText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.red || '#FF0000',
      textAlign: 'center',
      marginBottom: SH(10),
    },
    emptyText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      textAlign: 'center',
    },
    reloadButton: {
      borderRadius: SF(8),
    },
    listContent: {
      paddingTop: SH(16),
      paddingBottom: SH(24),
      paddingHorizontal: SW(16),
    },
    columnWrapper: {
      gap: columnGap,
      marginBottom: SH(14),
    },
    itemWrapper: {
      flex: 1,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white || '#FFFFFF',
      borderRadius: SF(12),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.border || 'rgba(0,0,0,0.06)',
    },
    coverImageLoader: {
      width: '100%',
      height: SH(100),
      backgroundColor: Colors.background || '#F5F5F5',
    },
    coverMainImage: {
      width: '100%',
      height: '100%',
    },
    itemText: {
      color: Colors.text,
      fontFamily: Fonts.MEDIUM,
      fontSize: SF(13),
      lineHeight: SF(18),
      marginTop: SH(10),
      marginBottom: SH(12),
      paddingHorizontal: SW(8),
      textAlign: 'center',
    },
  });
};
