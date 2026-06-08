import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';
import ImageLoader from '@components/common/ImageLoader';
import imagePaths from '@assets';
import type {
  FeaturedServiceItem,
  FeaturedListType,
} from '@services/api/queries/appQueries';
import RoutineAvailableBadge from '@components/provider/RoutineAvailableBadge';
import { isServiceRoutineEnabled } from '@utils/serviceRoutineConfig';
import { HOME_BENTO_RADIUS } from './bentoEffects';
import { HOME_CARD_SHADOW } from './homeLayout';
import LiquidBentoPressable from './LiquidBentoPressable';

type FeaturedServiceCardProps = {
  service: FeaturedServiceItem;
  onPress: (service: FeaturedServiceItem) => void;
  variant?: 'carousel' | 'grid';
  listType?: FeaturedListType;
  style?: StyleProp<ViewStyle>;
  index?: number;
};

const CAROUSEL_WIDTH = 160;
const CAROUSEL_IMAGE_H = 100;
const CAROUSEL_TITLE_H = 38;
const CAROUSEL_META_MIN_H = 40;

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
  index = 0,
}: FeaturedServiceCardProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme, variant), [theme, variant]);

  const imageUri = service.images?.[0] ?? null;
  const showOfferMeta = listType === 'topOffered';
  const showRoutine = isServiceRoutineEnabled(service);

  const averageRating =
    typeof service.averageRating === 'number' ? service.averageRating : 0;
  const ratingCount =
    typeof service.ratingCount === 'number' ? service.ratingCount : 0;
  const showRatingBadge = !showOfferMeta && averageRating > 0;

  const discountPercent = useMemo(() => {
    const d =
      typeof service.discountPercentage === 'number'
        ? service.discountPercentage
        : 0;
    const h =
      typeof service.highestDiscount === 'number' ? service.highestDiscount : 0;
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

  const hasPreferences = preferenceLabels.length > 0;
  const hasPriceType = !!priceTypeLabel;
  const preferencesText = preferenceLabels.join(' · ');
  const hasMetaFooter = hasPreferences || hasPriceType;

  return (
    <LiquidBentoPressable
      index={index}
      onPress={() => onPress(service)}
      bentoSurface={false}
      borderRadius={theme.SF(HOME_BENTO_RADIUS)}
      style={[styles.wrapper, HOME_CARD_SHADOW, style]}
      contentStyle={styles.liquidSurface}
    >
      <View style={styles.imageBox}>
        <ImageLoader
          source={imageUri ? { uri: imageUri } : imagePaths.no_image}
          resizeMode="cover"
          mainImageStyle={styles.image}
        />

        <View style={styles.imageOverlayRow} pointerEvents="none">
          <View style={styles.overlayLeft}>
            {showRoutine ? (
              <RoutineAvailableBadge
                service={service}
                compact
                style={styles.routineBadgeOnImage}
              />
            ) : null}
          </View>
          <View style={styles.overlayRight}>
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
          </View>
        </View>
      </View>

      <View style={styles.titleFooter}>
        <CustomText
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {service.name?.trim() || ''}
        </CustomText>
      </View>

      {hasMetaFooter ? (
        <View style={styles.metaFooter}>
          {hasPreferences ? (
            <CustomText
              color={theme.colors.lightText || '#666565'}
              fontFamily={theme.fonts.REGULAR}
              fontSize={theme.fontSize.xs}
              style={styles.metaLine}
              numberOfLines={1}
            >
              {preferencesText}
            </CustomText>
          ) : null}
          {hasPriceType ? (
            <CustomText
              numberOfLines={1}
              ellipsizeMode="tail"
              color={theme.colors.lightText || theme.colors.gray || '#888'}
              fontFamily={theme.fonts.SEMI_BOLD}
              fontSize={theme.fontSize.xs}
              style={hasPreferences ? styles.metaSecondLine : styles.metaLine}
            >
              {priceTypeLabel}
            </CustomText>
          ) : null}
        </View>
      ) : null}
    </LiquidBentoPressable>
  );
}

const createStyles = (theme: ThemeType, variant: 'carousel' | 'grid') => {
  const { SW, SH, SF, fonts, colors } = theme;
  const isCarousel = variant === 'carousel';

  return StyleSheet.create({
    wrapper: {
      width: isCarousel ? SW(CAROUSEL_WIDTH) : undefined,
      flex: isCarousel ? undefined : 1,
      borderRadius: SF(HOME_BENTO_RADIUS),
      overflow: 'hidden',
      backgroundColor: colors.white,
      ...(isCarousel
        ? {
            minHeight: SH(CAROUSEL_IMAGE_H) + SH(CAROUSEL_TITLE_H),
          }
        : {}),
    },
    liquidSurface: {
      backgroundColor: colors.white,
      flex: 1,
    },
    imageBox: {
      width: '100%',
      height: isCarousel ? SH(CAROUSEL_IMAGE_H) : SH(110),
      borderTopLeftRadius: SF(HOME_BENTO_RADIUS),
      borderTopRightRadius: SF(HOME_BENTO_RADIUS),
      overflow: 'hidden',
      backgroundColor: colors.secondary || '#F0F4F8',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlayRow: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingTop: SH(6),
      paddingHorizontal: SW(6),
    },
    overlayLeft: {
      flex: 1,
      alignItems: 'flex-start',
      minWidth: 0,
      paddingRight: SW(4),
    },
    overlayRight: {
      flexShrink: 0,
      alignItems: 'flex-end',
      maxWidth: '55%',
    },
    routineBadgeOnImage: {
      marginTop: 0,
      backgroundColor: 'rgba(255,255,255,0.95)',
    },
    discountBadge: {
      paddingHorizontal: SW(7),
      paddingVertical: SH(3),
      borderRadius: SF(6),
      backgroundColor: colors.primary || '#135D96',
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SW(6),
      paddingVertical: SH(3),
      borderRadius: SF(6),
      backgroundColor: 'rgba(0,0,0,0.65)',
    },
    ratingText: {
      marginLeft: SW(3),
    },
    titleFooter: {
      height: isCarousel ? SH(CAROUSEL_TITLE_H) : undefined,
      minHeight: isCarousel ? SH(CAROUSEL_TITLE_H) : SH(36),
      justifyContent: 'center',
      paddingHorizontal: SW(8),
      backgroundColor: colors.white,
    },
    title: {
      color: colors.text,
      fontFamily: fonts.SEMI_BOLD,
      fontSize: theme.fontSize.sm,
    },
    metaFooter: {
      minHeight: isCarousel ? SH(CAROUSEL_META_MIN_H) : SH(40),
      paddingHorizontal: SW(8),
      paddingTop: SH(4),
      paddingBottom: SH(8),
      backgroundColor: colors.white,
      borderBottomLeftRadius: SF(HOME_BENTO_RADIUS),
      borderBottomRightRadius: SF(HOME_BENTO_RADIUS),
    },
    metaLine: {
      lineHeight: theme.fontSize.xs * 1.4,
      flexShrink: 1,
    },
    metaSecondLine: {
      marginTop: SH(3),
      lineHeight: theme.fontSize.xs * 1.35,
    },
  });
};
