import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import Swiper from 'react-native-swiper';
import { Banner } from '@services/api/queries/appQueries';
import ImageLoader from '@components/common/ImageLoader';
import CustomButton from '@components/common/CustomButton';
import HomeSliderSkeleton from './HomeSliderSkeleton';

type HomeSliderProps = {
    banners?: Banner[];
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
};

export default function HomeSlider({ banners = [], isLoading = false, isError = false, onRetry }: HomeSliderProps) {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t } = useTranslation();
console.log('banners', banners);
    // Show loading state with skeleton
    if (isLoading) {
        return <HomeSliderSkeleton />;
    }

    // Show error state
    if (isError) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{t('home.failedToLoadBanners')}</Text>
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
    if (!banners || banners.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('home.noBannersAvailable')}</Text>
                </View>
            </View>
        );
    }

    // Filter banners with images and status true
    const activeBanners = banners.filter(banner => banner.status && banner.image);

    if (activeBanners.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('home.noBannersAvailable')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Swiper
                showsButtons={false}
                style={styles.wrapper}
                pagingEnabled={true}
                autoplay
                dot={<View style={styles.dot} />}
                activeDot={<View style={styles.activeDot} />}
                paginationStyle={styles.paginationStyle}
            >
                {activeBanners.map((banner) => (
                    <View style={[styles.slide]} key={banner._id}>
                        <ImageLoader
                            source={{ uri: banner.image }}
                            resizeMode="contain"
                            mainImageStyle={styles.image}
                            />
                    </View>
                ))}
            </Swiper>
        </View>
    )
}

const createStyles = (theme: ThemeType) => {
    const { colors: Colors, SF, fonts: Fonts, SW } = theme;
    return StyleSheet.create({
        container: {
            paddingHorizontal: SW(20),
            flex: 1,
        },
        wrapper: {
            height: SF(160),
        },
        dot: {
            backgroundColor: Colors.gray,
            width: SF(10),
            height: SF(10),
            borderRadius: SF(10) / 2,
            marginLeft: SF(3),
            marginRight: SF(3),
            marginBottom: -SF(20),
        },
        activeDot: {
            backgroundColor: Colors.primary,
            width: SF(10),
            height: SF(10),
            borderRadius: SF(10) / 2,
            marginLeft: SF(3),
            marginRight: SF(3),
            marginBottom: -SF(20),
        },
        paginationStyle: {
            bottom: 0,
        },
        slide: {
            height: SF(160),
            borderRadius: SF(10),
            overflow: 'hidden',
            backgroundColor:theme.colors.secondary,
        },
        image: {
            height: '100%',
            width: '100%',
            borderRadius: SF(10),
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
            color: Colors.text,
            textAlign: 'center',
        },
        retryButton: {
            borderRadius: SF(8),
        },
    })
}