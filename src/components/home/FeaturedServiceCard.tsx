import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import ImageLoader from '@components/common/ImageLoader';
import imagePaths from '@assets';
import type { FeaturedServiceItem } from '@services/api/queries/appQueries';

type FeaturedServiceCardProps = {
  service: FeaturedServiceItem;
  onPress: (service: FeaturedServiceItem) => void;
  /** Card outer size (carousel vs grid) */
  variant?: 'carousel' | 'grid';
  style?: StyleProp<ViewStyle>;
};

export default function FeaturedServiceCard({
  service,
  onPress,
  variant = 'carousel',
  style,
}: FeaturedServiceCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme, variant), [theme, variant]);

  const imageUri = service.images?.[0] ?? null;

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
        <View style={styles.titleWrap}>
          <CustomText
            numberOfLines={2}
            color="#FFFFFF"
            fontFamily={theme.fonts.SEMI_BOLD}
            fontSize={variant === 'carousel' ? theme.fontSize.md : theme.fontSize.sm}
            style={styles.title}
          >
            {service.name?.trim() || ''}
          </CustomText>
        </View>
      </View>
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
  });
};
