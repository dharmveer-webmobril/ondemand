import { View, FlatList, StyleSheet, Text } from 'react-native';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import imagePaths from '@assets';
import ImageLoader from '@components/common/ImageLoader';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Category } from '@services/api/queries/appQueries';
import CustomButton from '@components/common/CustomButton';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import HomeCategoryListSkeleton from './HomeCategoryListSkeleton';
import { HOME_BENTO_RADIUS } from './bentoEffects';
import { HOME_HORIZONTAL_PADDING } from './homeLayout';
import LiquidBentoPressable from './LiquidBentoPressable';

type HomeCategoryListProps = {
  categories?: Category[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const CATEGORY_BOX_SIZE = 82;

const HomeCategoryItem = memo(
  ({ name, image, category, index }: any) => {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handlePress = () => {
      navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, {
        category,
        resetSession: true,
      });
    };

    const displayName = name
      ? name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
      : '';

    return (
      <View style={styles.itemContainer}>
        <LiquidBentoPressable
          index={index}
          onPress={handlePress}
          borderRadius={theme.SF(HOME_BENTO_RADIUS)}
          contentStyle={styles.imageBox}
        >
          <ImageLoader
            source={image}
            resizeMode="cover"
            mainImageStyle={styles.mainImage}
          />
        </LiquidBentoPressable>
        <CustomText style={styles.text} numberOfLines={1}>
          {displayName}
        </CustomText>
      </View>
    );
  },
);

export default function HomeCategoryList({
  categories = [],
  isLoading = false,
  isError = false,
  onRetry,
}: HomeCategoryListProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  if (isLoading) {
    return <HomeCategoryListSkeleton />;
  }

  if (isError) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('home.failedToLoadCategories')}</Text>
          {onRetry ? (
            <CustomButton
              title={t('category.retry')}
              onPress={onRetry}
              buttonStyle={styles.retryButton}
              textColor={theme.colors.whitetext}
              backgroundColor={theme.colors.primary}
              paddingHorizontal={theme.SW(20)}
              marginTop={theme.SH(10)}
            />
          ) : null}
        </View>
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.emptyText}>{t('category.empty')}</Text>
      </View>
    );
  }

  const activeCategories = categories.filter(category => category.status);

  if (activeCategories.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.emptyText}>{t('category.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        horizontal
        data={activeCategories}
        keyExtractor={(item, idx) => item._id || `${idx}-cat-home`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <HomeCategoryItem
            index={index}
            catId={item._id}
            name={item.name}
            image={item.image ? { uri: item.image } : imagePaths.no_image}
            category={item}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  const boxSize = SF(CATEGORY_BOX_SIZE);

  return StyleSheet.create({
    itemContainer: {
      alignItems: 'center',
      width: boxSize,
    },
    imageBox: {
      width: boxSize,
      height: boxSize,
      backgroundColor: Colors.secondary || '#F0F4F8',
    },
    mainImage: {
      width: '100%',
      height: '100%',
    },
    text: {
      color: Colors.text,
      fontFamily: Fonts.MEDIUM,
      fontSize: SF(12),
      marginTop: SH(8),
      width: boxSize,
      textAlign: 'center',
    },
    stateContainer: {
      paddingHorizontal: SW(HOME_HORIZONTAL_PADDING),
      alignSelf: 'center',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: SH(100),
    },
    listContainer: {
      paddingHorizontal: SW(HOME_HORIZONTAL_PADDING),
      marginTop: SH(10),
    },
    listContent: {
      paddingRight: SW(4),
    },
    itemSeparator: {
      width: SW(14),
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SH(20),
    },
    errorText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.red || '#FF0000',
      textAlign: 'center',
    },
    emptyText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      textAlign: 'center',
    },
    retryButton: {
      borderRadius: SF(8),
    },
  });
};
