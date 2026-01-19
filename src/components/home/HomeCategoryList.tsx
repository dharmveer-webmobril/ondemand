import { View, FlatList, Pressable, StyleSheet, ActivityIndicator, Text } from 'react-native'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next';
import { CustomText, Spacing } from '@components/common';
import imagePaths from '@assets';
import ImageLoader from '@components/common/ImageLoader';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Category } from '@services/api/queries/appQueries';
import CustomButton from '@components/common/CustomButton';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';

type HomeCategoryListProps = {
    categories?: Category[];
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
};

const SeparatorComponent = () => <Spacing horizontal space={15} />;
const HomeCategoryItem = memo(({ name, image,  category }: any) => {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    
    const handlePress = () => {
        navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, { category });
    };
    
    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressedContainer,
            ]}
        >
            <View style={styles.imageLoader}>
                <ImageLoader
                    source={image}
                    resizeMode="cover"
                    mainImageStyle={styles.mainImage}
                />
            </View>
            <CustomText style={styles.text} numberOfLines={2}>
                {name ? name.trim().charAt(0).toUpperCase() + name.trim().slice(1) : ''}
            </CustomText>
        </Pressable>
    );
});

export default function HomeCategoryList({ categories = [], isLoading = false, isError = false, onRetry }: HomeCategoryListProps) {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t } = useTranslation();

    // Show loading state
    if (isLoading) {
        return (
            <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Show error state
    if (isError) {
        return (
            <View style={styles.stateContainer}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{t('home.failedToLoadCategories')}</Text>
                    {onRetry && (
                        <CustomButton
                            title={t('category.retry')}
                            onPress={onRetry}
                            buttonStyle={styles.retryButton}
                            textColor={theme.colors.whitetext}
                            backgroundColor={theme.colors.primary}
                            paddingHorizontal={theme.SW(20)}
                            marginTop={theme.SH(10)}
                        />
                    )}
                </View>
            </View>
        );
    }

    // Show empty state
    if (!categories || categories.length === 0) {
        return (
            <View style={styles.stateContainer}>
                <Text style={styles.emptyText}>No categories available</Text>
            </View>
        );
    }

    // Filter categories with status true
    const activeCategories = categories.filter(category => category.status);

    if (activeCategories.length === 0) {
        return (
            <View style={styles.stateContainer}>
                <Text style={styles.emptyText}>No categories available</Text>
            </View>
        );
    }

    return (
        <View style={styles.listContainer}>
            <FlatList
                horizontal
                data={activeCategories}
                keyExtractor={(item, index) => item._id || index + 'cat-home'}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return <HomeCategoryItem
                        key={`homecategory-${item?._id ?? index}`}
                        catId={item._id}
                        name={item.name}
                        image={item.image ? { uri: item.image } : imagePaths.no_image}
                        category={item}
                    />
                }}
                ItemSeparatorComponent={SeparatorComponent}
            />
        </View>
    )
}

const createStyles = (theme: ThemeType) => {
    const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
    return StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        pressedContainer: {
            opacity: 0.8,
        },
        imageLoader: {
            height: SF(58),
            width: SF(58),
            borderRadius: SF(58) / 2,
            borderWidth: 1,
            borderColor: Colors.primary,
            overflow: 'hidden',
        },
        mainImage: {
            width: '100%',
            height: '100%',
        },
        text: {
            color: Colors.text,
            fontFamily: Fonts.MEDIUM,
            fontSize: SF(12),
            marginTop: 5,
            maxWidth: SW(80),
            textAlign: 'center',
        },
        stateContainer: {
            paddingHorizontal: SW(20),
            alignSelf: 'center',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: SH(100),
        },
        listContainer: {
            paddingHorizontal: SW(20),
            alignSelf: 'center',
            flex: 1,
            marginTop: -SH(15),
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
    })
}