import { View, StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, DistanceLabel, ImageLoader, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import { ServiceProvider } from '@services/api/queries/appQueries';
import {
  formatAddress,
  getProviderDisplayName,
} from '@utils/tools';

type HomeProviderItemProps = {
  provider: ServiceProvider;
  onPress?: () => void;
  /** Full-width row for vertical lists; default is home carousel card */
  layout?: 'carousel' | 'list';
};

const CAROUSEL_AVATAR_SIZE = 48;
const CAROUSEL_COVER_HEIGHT = 104;
const CAROUSEL_CARD_WIDTH = 220;
const LIST_AVATAR_SIZE = 56;
const LIST_COVER_HEIGHT = 128;

export default function HomeProviderItem({
  provider,
  onPress,
  layout = 'carousel',
}: HomeProviderItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(
    () => createStyles(theme, layout),
    [theme, layout],
  );
  const iconSize = theme.SF(layout === 'carousel' ? 14 : 16);

  const address =
    formatAddress({
      line1: provider.businessProfile?.line1,
      line2: provider.businessProfile?.line2,
      landmark: provider.businessProfile?.landmark,
      pincode: provider.businessProfile?.pincode,
      city: provider.businessProfile?.city?.name,
      country: provider.businessProfile?.country?.name,
    }) ||
    provider.city?.name ||
    '';

  const rating =
    typeof provider?.rating === 'number' ? provider.rating : null;

  const coverSource = provider.businessProfile?.bannerImage
    ? { uri: provider.businessProfile.bannerImage }
    : imagePaths.no_image;

  const profileSource = provider.profileImage
    ? { uri: provider.profileImage }
    : imagePaths.no_image;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressedContainer,
      ]}
    >
      <View style={styles.coverSection}>
        <View style={styles.coverImageClip}>
          <ImageLoader
            source={coverSource}
            mainImageStyle={styles.coverImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.avatarWrap}>
          <ImageLoader
            source={profileSource}
            mainImageStyle={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <CustomText style={styles.providerName} numberOfLines={2}>
          {getProviderDisplayName(provider)}
        </CustomText>

        <View style={styles.metaRow}>
          <View style={styles.addressBlock}>
            <VectoreIcons
              name="location-outline"
              icon="Ionicons"
              size={iconSize}
              color={theme.colors.lightText || '#888'}
            />
            <CustomText style={styles.addressText} numberOfLines={2}>
              {address || '—'}
            </CustomText>
          </View>
          {rating != null && rating > 0 ? (
            <View style={styles.ratingBlock}>
              <VectoreIcons
                name="star"
                icon="Ionicons"
                size={iconSize}
                color="#FAAC00"
              />
              <CustomText style={styles.ratingText}>
                {rating.toFixed(1)}
              </CustomText>
            </View>
          ) : (
            <View style={styles.ratingBlock}>
              <VectoreIcons
                name="star-outline"
                icon="Ionicons"
                size={iconSize}
                color={theme.colors.lightText || '#CCC'}
              />
              <CustomText style={styles.ratingMuted}>—</CustomText>
            </View>
          )}
        </View>
        <DistanceLabel
          distanceKm={provider.distanceKm}
          style={styles.distanceRow}
          textStyle={styles.distanceText}
        />
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType, layout: 'carousel' | 'list') => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  const isCarousel = layout === 'carousel';
  const avatarSize = isCarousel ? CAROUSEL_AVATAR_SIZE : LIST_AVATAR_SIZE;
  const coverHeight = isCarousel ? CAROUSEL_COVER_HEIGHT : LIST_COVER_HEIGHT;
  const overlap = avatarSize / 2;

  return StyleSheet.create({
    container: {
      width: layout === 'list' ? '100%' : SW(CAROUSEL_CARD_WIDTH),
      marginRight: layout === 'list' ? 0 : SW(12),
      marginBottom: layout === 'list' ? SH(14) : 0,
      backgroundColor: Colors.white,
      borderRadius: SF(isCarousel ? 14 : 16),
      overflow: 'visible',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    pressedContainer: {
      opacity: 0.94,
      transform: [{ scale: 0.99 }],
    },
    coverSection: {
      position: 'relative',
    },
    coverImageClip: {
      height: coverHeight,
      borderTopLeftRadius: SF(isCarousel ? 14 : 16),
      borderTopRightRadius: SF(isCarousel ? 14 : 16),
      overflow: 'hidden',
    },
    coverImage: {
      width: '100%',
      height: coverHeight,
    },
    avatarWrap: {
      position: 'absolute',
      bottom: -overlap,
      right: SW(isCarousel ? 10 : 12),
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      borderWidth: isCarousel ? 2 : 3,
      borderColor: Colors.white,
      backgroundColor: Colors.white,
      overflow: 'hidden',
      zIndex: 2,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: avatarSize / 2,
    },
    bottomSection: {
      paddingHorizontal: SW(isCarousel ? 10 : 12),
      paddingTop: SH(isCarousel ? 5 : 6),
      paddingBottom: SH(isCarousel ? 10 : 12),
    },
    providerName: {
      fontSize: SF(isCarousel ? 14 : 16),
      fontFamily: Fonts.BOLD,
      color: Colors.text,
      marginBottom: SH(isCarousel ? 6 : 8),
      paddingRight: SW(4),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: SW(8),
    },
    addressBlock: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(4),
      minWidth: 0,
    },
    addressText: {
      flex: 1,
      fontSize: SF(isCarousel ? 11 : 12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || '#666',
      lineHeight: SF(isCarousel ? 15 : 17),
    },
    ratingBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(4),
      flexShrink: 0,
      paddingTop: SH(1),
    },
    ratingText: {
      fontSize: SF(isCarousel ? 12 : 13),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    ratingMuted: {
      fontSize: SF(isCarousel ? 12 : 13),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || '#999',
    },
    distanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(4),
      marginTop: SH(6),
    },
    distanceText: {
      fontSize: SF(isCarousel ? 11 : 12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || '#666',
    },
  });
};
