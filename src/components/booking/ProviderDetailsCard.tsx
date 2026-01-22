import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CustomText, VectoreIcons, ImageLoader } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import imagePaths from '@assets';

type ProviderDetailsCardProps = {
  providerName: string;
  providerPhone: string;
  providerImage?: string;
  onCall: (phone: string) => void;
};

export default function ProviderDetailsCard({
  providerName,
  providerPhone,
  providerImage,
  onCall,
}: ProviderDetailsCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const imageSource = providerImage ? { uri: providerImage } : imagePaths.no_image;

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <CustomText
          fontSize={theme.fontSize.md}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          Provider Details
        </CustomText>
      </View>
      <View style={styles.providerHeaderRow}>
        <View style={styles.providerImageContainer}>
          <ImageLoader
            source={imageSource}
            mainImageStyle={styles.providerImage}
            resizeMode="cover"
            fallbackImage={imagePaths.no_image}
          />
        </View>
        <View style={styles.providerInfo}>
          <CustomText
            fontSize={theme.fontSize.lg}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
          >
            {providerName}
          </CustomText>
        </View>
        <Pressable
          style={styles.callButton}
          onPress={() => onCall(providerPhone)}
        >
          <VectoreIcons
            name="phone"
            icon="Ionicons"
            size={theme.SF(20)}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>
      <Pressable
        style={styles.detailRow}
        onPress={() => onCall(providerPhone)}
      >
        <VectoreIcons
          name="call-outline"
          icon="Ionicons"
          size={theme.SF(18)}
          color={theme.colors.lightText}
        />
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.primary}
          style={styles.detailText}
        >
          {providerPhone}
        </CustomText>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    providerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(12),
    },
    providerImageContainer: {
      width: theme.SF(50),
      height: theme.SF(50),
      borderRadius: theme.SF(25),
      overflow: 'hidden',
      backgroundColor: theme.colors.gray || '#F5F5F5',
      marginRight: theme.SW(12),
    },
    providerImage: {
      width: '100%',
      height: '100%',
    },
    providerInfo: {
      flex: 1,
    },
    callButton: {
      width: theme.SF(40),
      height: theme.SF(40),
      borderRadius: theme.SF(20),
      backgroundColor: theme.colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(12),
    },
    detailText: {
      marginLeft: theme.SW(12),
      flex: 1,
    },
    titleContainer: {
      marginBottom: theme.SH(12),
    },
  });
