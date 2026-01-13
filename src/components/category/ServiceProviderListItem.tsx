import { View, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import StarRating from 'react-native-star-rating-widget';
import { CustomText, ImageLoader, Spacing } from '@components/common';
import imagePaths from '@assets';

type ServiceProviderListItemProps = {
  id: string;
  name: string;
  logo?: string;
  images?: string[];
  address: string;
  rating: number;
  reviewCount: number;
  serviceType?: string;
  isVerified?: boolean;
  isOpen?: boolean;
  onPress?: () => void;
  providerId?: string;
};

export default function ServiceProviderListItem({
  id,
  name,
  logo,
  images = [],
  address,
  rating,
  reviewCount,
  serviceType,
  isVerified = false,
  isOpen = true,
  onPress,
  providerId,
}: ServiceProviderListItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.content}>
        {/* Logo and Name Section */}
        <View style={styles.header}>
          <ImageLoader
            source={logo ? { uri: logo } : imagePaths.no_image}
            mainImageStyle={styles.logo}
            resizeMode="cover"
          />
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <CustomText style={styles.name} numberOfLines={1}>
                {name}
              </CustomText>
              {isVerified && (
                <Image
                  source={imagePaths.verified_star}
                  style={styles.verifiedIcon}
                  resizeMode="contain"
                />
              )}
            </View>
            {serviceType && (
              <CustomText style={styles.serviceType} numberOfLines={1}>
                {serviceType}
              </CustomText>
            )}
          </View>
        </View>

        {/* Images Gallery */}
        {images.length > 0 && (
          <>
            <Spacing space={12} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContainer}
            >
              {images.slice(0, 4).map((image, index) => (
                <ImageLoader
                  key={index}
                  source={{ uri: image }}
                  mainImageStyle={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Address and Rating */}
        <Spacing space={12} />
        <View style={styles.footer}>
          <View style={styles.addressContainer}>
            <Image
              source={imagePaths.service_loc}
              style={styles.locationIcon}
              resizeMode="contain"
            />
            <CustomText style={styles.address} numberOfLines={2}>
              {address}
            </CustomText>
          </View>
          <View style={styles.ratingContainer}>
            <StarRating
              starStyle={styles.starStyle}
              starSize={theme.SF(14)}
              rating={rating}
              onChange={() => {}}
              color="#FAAC00"
              readOnly
            />
            <CustomText style={styles.ratingText}>
              {typeof rating === 'number' ? rating.toFixed(1) : '0.0'} ({reviewCount} Reviews)
            </CustomText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      marginHorizontal: SW(20),
      marginBottom: SH(16),
      borderRadius: SF(12),
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    content: {
      padding: SW(16),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: SF(48),
      height: SF(48),
      borderRadius: SF(24),
    },
    nameContainer: {
      flex: 1,
      marginLeft: SW(12),
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      flex: 1,
    },
    verifiedIcon: {
      width: SF(16),
      height: SF(16),
      marginLeft: SW(6),
    },
    serviceType: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
      marginTop: SF(4),
    },
    imagesContainer: {
      gap: SW(8),
    },
    galleryImage: {
      width: SW(80),
      height: SF(80),
      borderRadius: SF(8),
      marginRight: SW(8),
    },
    footer: {
      gap: SH(8),
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    locationIcon: {
      width: SF(16),
      height: SF(16),
      tintColor: Colors.textAppColor || Colors.text,
      marginTop: SF(2),
      marginRight: SW(6),
    },
    address: {
      flex: 1,
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
      lineHeight: SF(16),
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    ratingText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
    },
    starStyle: {
      marginHorizontal: 1,
    },
  });
};

