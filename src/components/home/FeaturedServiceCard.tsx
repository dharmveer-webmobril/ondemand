import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';
import ImageLoader from '@components/common/ImageLoader';
import imagePaths from '@assets';
import type {
  FeaturedServiceItem,
  FeaturedListType,
} from '@services/api/queries/appQueries';
import ServiceNameWithRoutineBadge from '@components/provider/ServiceNameWithRoutineBadge';

type FeaturedServiceCardProps = {
  service: FeaturedServiceItem;
  onPress: (service: FeaturedServiceItem) => void;
  /** Card outer size (carousel vs grid) */
  variant?: 'carousel' | 'grid';
  /** When top-offered, show discount, preferences, and price type */
  listType?: FeaturedListType;
  style?: StyleProp<ViewStyle>;
};

function preferenceLabelKey(pref: string): string {
  const k = pref.trim();
  return `home.servicePreference.${k}`;
}

function priceTypeLabelKey(priceType: string): string {
  const k = String(priceType).trim();
  return `home.priceType.${k}`;
}

export default function FeaturedServiceCard({
  service,
  onPress,
  variant = 'carousel',
  listType,
  style,
}: FeaturedServiceCardProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme, variant), [theme, variant]);

  const imageUri = service.images?.[0] ?? null;
  const showOfferMeta = listType === 'topOffered';

  const averageRating =
    typeof service.averageRating === 'number' ? service.averageRating : 0;
  const ratingCount =
    typeof service.ratingCount === 'number' ? service.ratingCount : 0;
  const showRatingBadge = averageRating > 0;

  const discountPercent = useMemo(() => {
    const d = typeof service.discountPercentage === 'number' ? service.discountPercentage : 0;
    const h = typeof service.highestDiscount === 'number' ? service.highestDiscount : 0;
    return Math.max(d, h);
  }, [service.discountPercentage, service.highestDiscount]);

  const preferenceLabels = useMemo(() => {
    const prefs = service.preferences?.filter(Boolean) ?? [];
    return prefs.map(p => {
      const key = preferenceLabelKey(p);
      const translated = t(key);
      return translated === key ? p : translated;
    });
  }, [service.preferences, t]);

  const priceTypeLabel = useMemo(() => {
    const pt = service.priceType?.trim();
    if (!pt) return '';
    const key = priceTypeLabelKey(pt);
    const translated = t(key);
    return translated === key ? pt : translated;
  }, [service.priceType, t]);

  return (
    <Pressable
      onPress={() => onPress(service)}
      style={({ pressed }) => [
        styles.wrapper,
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageBox}>
        <ImageLoader
          source={imageUri ? { uri: imageUri } : imagePaths.no_image}
          resizeMode="contain"
          mainImageStyle={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.45, 1]}
          style={styles.gradient}
        />
        {showOfferMeta && discountPercent > 0 ? (
          <View style={styles.discountBadge}>
            <CustomText
              color="#FFFFFF"
              fontFamily={theme.fonts.BOLD}
              fontSize={theme.fontSize.xs}
            >
              {t('home.offerDiscount', {
                percent: Math.round(discountPercent),
              })}
            </CustomText>
          </View>
        ) : null}
        {showRatingBadge ? (
          <View style={styles.ratingBadge}>
            <VectoreIcons
              icon="Ionicons"
              name="star"
              size={theme.SF(11)}
              color="#FFC107"
            />
            <CustomText
              color="#FFFFFF"
              fontFamily={theme.fonts.SEMI_BOLD}
              fontSize={theme.fontSize.xs}
              style={styles.ratingText}
            >
              {averageRating.toFixed(1)}
              {ratingCount > 0 ? ` (${ratingCount})` : ''}
            </CustomText>
          </View>
        ) : null}
        <View style={styles.titleWrap}>
          <ServiceNameWithRoutineBadge
            name={service.name?.trim() || ''}
            service={service}
            numberOfLines={2}
            nameStyle={[
              styles.title,
              {
                color: '#FFFFFF',
                fontFamily: theme.fonts.SEMI_BOLD,
                fontSize:
                  variant === 'carousel'
                    ? theme.fontSize.md
                    : theme.fontSize.sm,
              },
            ]}
            badgeStyle={styles.routineBadgeOnImage}
            containerStyle={styles.titleNameBlock}
          />
        </View>
      </View>
      {showOfferMeta &&
      (preferenceLabels.length > 0 || priceTypeLabel) ? (
        <View style={styles.metaFooter}>
          {showOfferMeta && preferenceLabels.length > 0 ? (
            <CustomText
              numberOfLines={2}
              color={theme.colors.gray || '#666'}
              fontFamily={theme.fonts.REGULAR}
              fontSize={theme.fontSize.xs}
              style={styles.metaLine}
            >
              {preferenceLabels.join(' · ')}
            </CustomText>
          ) : null}
          {showOfferMeta && priceTypeLabel ? (
            <CustomText
              numberOfLines={1}
              color={theme.colors.lightText || theme.colors.gray || '#888'}
              fontFamily={theme.fonts.SEMI_BOLD}
              fontSize={theme.fontSize.xs}
              style={preferenceLabels.length > 0 ? styles.metaSecondLine : styles.metaLine}
            >
              {priceTypeLabel}
            </CustomText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const createStyles = (theme: ThemeType, variant: 'carousel' | 'grid') => {
  const { SW, SH, SF } = theme;
  const isCarousel = variant === 'carousel';
  return StyleSheet.create({
    wrapper: {
      width: isCarousel ? SW(160) : undefined,
      flex: isCarousel ? undefined : 1,
      borderRadius: SF(12),
      overflow: 'hidden',
      backgroundColor: theme.colors.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    pressed: {
      opacity: 0.92,
    },
    imageBox: {
      width: '100%',
      height: isCarousel ? SH(110) : SH(110),
      borderRadius: SF(12),
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: SF(12),
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: SF(12),
    },
    titleWrap: {
      position: 'absolute',
      left: SW(12),
      right: SW(12),
      bottom: SH(10),
    },
    title: {
      textShadowColor: 'rgba(0,0,0,0.45)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    titleNameBlock: {
      width: '100%',
    },
    routineBadgeOnImage: {
      marginTop: SH(6),
      backgroundColor: 'rgba(255,255,255,0.95)',
    },
    discountBadge: {
      position: 'absolute',
      top: SH(8),
      right: SW(8),
      paddingHorizontal: SW(8),
      paddingVertical: SH(4),
      borderRadius: SF(8),
      backgroundColor: theme.colors.primary || '#135D96',
    },
    ratingBadge: {
      position: 'absolute',
      top: SH(8),
      left: SW(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SW(6),
      paddingVertical: SH(3),
      borderRadius: SF(8),
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    ratingText: {
      marginLeft: SW(3),
    },
    metaFooter: {
      paddingHorizontal: SW(8),
      paddingTop: SH(6),
      paddingBottom: SH(8),
      backgroundColor: theme.colors.white,
    },
    metaLine: {
      lineHeight: theme.fontSize.xs * 1.35,
    },
    metaSecondLine: {
      marginTop: SH(4),
      lineHeight: theme.fontSize.xs * 1.35,
    },
  });
};
