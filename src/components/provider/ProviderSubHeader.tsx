


import { View, StyleSheet, Pressable, } from 'react-native';
import React, { useMemo, useState } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';

type ProviderHeaderProps = {
  logo?: string;
  name: string;
  address: string;
  serviceType?: string;
  rating?: number;
  reviewCount?: number;
  onShare?: () => void;
  onFavorite?: (isFavorite: boolean) => void;
  isFavorite?: boolean;
};

export default function ProviderHeader({
  address,
  serviceType,
  reviewCount,
  onShare,
  onFavorite,
  isFavorite: initialFavorite = false,
}: ProviderHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleFavoritePress = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    if (onFavorite) {
      onFavorite(newFavorite);
    }
  };

  return (
    <View style={styles.container}>
      {/* Info Section */}
      <View style={styles.infoContainer}>
        <CustomText style={styles.address} numberOfLines={2}>
          {address}
        </CustomText>
        {serviceType && (
          <CustomText style={styles.serviceType}>{serviceType}</CustomText>
        )}
        {reviewCount !== undefined && (
          <CustomText style={styles.reviewCount}>
            {reviewCount} Reviews
          </CustomText>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onShare && (
          <Pressable
            onPress={onShare}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <VectoreIcons
              name="share"
              icon="Ionicons"
              size={theme.SF(24)}
              color={theme.colors.text}
            />
          </Pressable>
        )}
        {onFavorite && (
          <Pressable
            onPress={handleFavoritePress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <VectoreIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              icon="Ionicons"
              size={theme.SF(24)}
              color={isFavorite ? '#FF0000' : theme.colors.text}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      backgroundColor: Colors.secondary,
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
      alignItems: 'center',
    },
    logoContainer: {
      marginRight: SW(12),
    },
    logo: {
      width: SF(60),
      height: SF(60),
      borderRadius: SF(30),
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(4),
    },
    name: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      flex: 1,
    },
    ratingBadge: {
      marginLeft: SW(8),
      backgroundColor: Colors.secondary || '#E3F2FD',
      paddingHorizontal: SW(8),
      paddingVertical: SH(2),
      borderRadius: SF(12),
    },
    ratingText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    address: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(2),
    },
    serviceType: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
      marginBottom: SH(2),
    },
    reviewCount: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(12),
    },
    actionButton: {
      padding: SW(8),
    },
  });
};

