import { View, StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import { ServiceProvider } from '@services/api/queries/appQueries';
import { formatAddress } from '@utils/tools';

type HomeProviderItemProps = {
  provider: ServiceProvider;
  onPress?: () => void;
};

const AVATAR_SIZE = 56;
const COVER_HEIGHT = 128;

export default function HomeProviderItem({
  provider,
  onPress,
}: HomeProviderItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          {provider.name}
        </CustomText>

        <View style={styles.metaRow}>
          <View style={styles.addressBlock}>
            <VectoreIcons
              name="location-outline"
              icon="Ionicons"
              size={theme.SF(16)}
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
                size={theme.SF(16)}
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
                size={theme.SF(16)}
                color={theme.colors.lightText || '#CCC'}
              />
              <CustomText style={styles.ratingMuted}>—</CustomText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  const overlap = AVATAR_SIZE / 2;

  return StyleSheet.create({
    container: {
      width: SW(260),
      marginRight: SW(14),
      backgroundColor: Colors.white,
      borderRadius: SF(16),
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
      height: COVER_HEIGHT,
      borderTopLeftRadius: SF(16),
      borderTopRightRadius: SF(16),
      overflow: 'hidden',
    },
    coverImage: {
      width: '100%',
      height: COVER_HEIGHT,
    },
    avatarWrap: {
      position: 'absolute',
      bottom: -overlap,
      right: SW(12),
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 3,
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
      borderRadius: AVATAR_SIZE / 2,
    },
    bottomSection: {
      paddingHorizontal: SW(12),
      paddingTop: SH(6),
      paddingBottom: SH(12),
    },
    providerName: {
      fontSize: SF(16),
      fontFamily: Fonts.BOLD,
      color: Colors.text,
      marginBottom: SH(8),
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
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || '#666',
      lineHeight: SF(17),
    },
    ratingBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(4),
      flexShrink: 0,
      paddingTop: SH(1),
    },
    ratingText: {
      fontSize: SF(13),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    ratingMuted: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || '#999',
    },
  });
};
