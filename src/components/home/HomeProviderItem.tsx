import { View, StyleSheet, Pressable, Image } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import StarRating from 'react-native-star-rating-widget';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import { ServiceProvider } from '@services/api/queries/appQueries';

type HomeProviderItemProps = {
  provider: ServiceProvider;
  onPress?: () => void;
};

export default function HomeProviderItem({ provider, onPress }: HomeProviderItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const address = provider.businessProfile?.address || provider.city?.name || '';
  const rating = typeof provider?.rating === 'number' ? provider.rating : 0;
  const isVerified = provider?.isVerified || false;
  const profileImage = provider?.profileImage ? { uri: provider?.profileImage } : imagePaths.no_image;
  const bannerImage = provider.businessProfile?.bannerImage;
  const serviceType = provider.businessProfile?.name || 'Service Provider';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressedContainer,
      ]}
    >
      {/* Banner Image */}
      {/* {  (
        <View style={styles.bannerContainer}>
          <ImageLoader
            source={bannerImage ? { uri: bannerImage } : imagePaths.no_image}
            mainImageStyle={styles.bannerImage}
            resizeMode="cover"
          />
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Image source={imagePaths.verified_star} style={styles.verifiedIcon} resizeMode="contain" />
            </View>
          )}
        </View>
      )} */}

      {/* Content Section */}
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <ImageLoader
                source={profileImage}
                mainImageStyle={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <CustomText style={styles.providerName} numberOfLines={1}>
              {provider.name}
            </CustomText>
            {serviceType && (
              <CustomText style={styles.serviceType} numberOfLines={1}>
                {serviceType}
              </CustomText>
            )}
          </View>
        </View>

        {/* Rating Section */}
        {rating > 0 && (
          <View style={styles.ratingSection}>
            <StarRating
              starStyle={styles.starStyle}
              starSize={theme.SF(14)}
              rating={rating}
              onChange={() => {}}
              color="#FAAC00"
            />
            <CustomText style={styles.ratingText}>
              {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
            </CustomText>
          </View>
        )}

        {/* Address Section */}
        {address && (
          <View style={styles.addressSection}>
            <VectoreIcons
              name="location"
              icon="Ionicons"
              size={theme.SF(14)}
              color={theme.colors.textAppColor || theme.colors.text}
            />
            <CustomText style={styles.addressText} numberOfLines={2}>
              {address}
            </CustomText>
          </View>
        )}
      </View>
    </Pressable>
  );
}
const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      width: SW(220),
      marginRight: SW(16),
      backgroundColor: Colors.white,
      borderRadius: SF(16),
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      
    },
    pressedContainer: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    bannerContainer: {
      width: '100%',
      height: SF(100),
      position: 'relative',
    },
    profileImageWrapper: {
      width: SF(50),
      height: SF(50),
      borderRadius: SF(25),
      borderWidth: 1,
      borderColor: Colors.primary,
      overflow: 'hidden',
    },
    profileImage: {  
     width: '100%',
     height: '100%',
    },
    verifiedIcon: {
      width: SF(16),
      height: SF(16),
    },
    content: {
      padding: SW(12),
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(12),
    },
    profileImageContainer: {
      position: 'relative',
      marginRight: SW(10),
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    verifiedBadge: {
      position: 'absolute',
      top: SF(8),
      right: SF(8),
      backgroundColor: Colors.white,
      borderRadius: SF(16),
      padding: SF(4),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
 
    verifiedBadgeSmall: {
      position: 'absolute',
      // bottom: -SF(2),
      // right: -SF(2),
      backgroundColor: Colors.white,
      borderRadius: SF(10),
      padding: SF(2),
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    verifiedIconSmall: {
      width: SF(12),
      height: SF(12),
    },
    profileInfo: {
      flex: 1,
    },
    providerName: {
      fontSize: SF(15),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(2),
    },
    serviceType: {
      fontSize: SF(11),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    ratingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(10),
      gap: SW(6),
    },
    ratingText: {
      fontSize: SF(13),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    starStyle: {
      marginHorizontal: 1,
    },
    addressSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(6),
    },
    addressText: {
      flex: 1,
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      lineHeight: SF(16),
    },
  });
};