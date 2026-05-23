import { View, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  CustomText,
  CustomButton,
  ImageLoader,
} from '@components/common';
import imagePaths from '@assets';
import ServiceNameWithRoutineBadge from './ServiceNameWithRoutineBadge';
import { formatPreferenceLabel } from '@utils/tools';
import type { ServiceRoutineConfig } from '@utils/serviceRoutineConfig';

type BestOffer = {
  title: string;
  discountValue: number;
};

type ServiceItemProps = {
  id: string;
  name: string;
  price: number;
  duration?: string;
  icon?: string;
  onBook?: () => void;
  isShowBookButton?: boolean;
  image?: ImageSourcePropType;
  bestOffer?: BestOffer | null;
  showPreferences?: string[];
  routineConfig?: ServiceRoutineConfig | null;
};

export default function ServiceItem({
  showPreferences,
  name,
  price,
  duration,
  icon = 'cut',
  onBook,
  isShowBookButton = true,
  image = imagePaths.no_image,
  bestOffer = null,
  routineConfig,
}: ServiceItemProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const hasOffer = bestOffer != null && Number(bestOffer?.discountValue) > 0;
  const discountValue = hasOffer
    ? Math.min(100, Math.max(0, Number(bestOffer?.discountValue) || 0))
    : 0;
  const discountedPrice =
    hasOffer && Number.isFinite(price)
      ? price * (1 - discountValue / 100)
      : price;
  const displayPrice = Number.isFinite(discountedPrice)
    ? discountedPrice
    : price;

  const preferences =
    showPreferences &&
    showPreferences.map((preference: string) =>
      formatPreferenceLabel(preference, t),
    );

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.serviceImageContainer}>
            <ImageLoader
              source={image}
              mainImageStyle={styles.serviceImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.infoContainer}>
            <ServiceNameWithRoutineBadge
              name={name}
              routineConfig={routineConfig}
              nameStyle={styles.serviceName}
              containerStyle={styles.nameBlock}
            />
            {/* {hasOffer && (
              <View style={styles.offerBadge}>
                <CustomText style={styles.offerBadgeText}>
                  {bestOffer?.title ?? 'Offer'} – {discountValue}% off
                </CustomText>
              </View>
            )} */}
            <View style={styles.priceContainer}>
              {/* {hasOffer 
              ? (
                <>
                  <CustomText style={styles.originalPrice}>${(Number.isFinite(price) ? price : 0).toFixed(2)}</CustomText>
                  <CustomText style={styles.price}>${displayPrice.toFixed(2)}</CustomText>
                </>
              ) : ( */}
              <CustomText style={styles.price}>
                ${(Number.isFinite(price) ? price : 0).toFixed(2)}
              </CustomText>
              {/* )} */}
              {duration && (
                <CustomText style={styles.duration}>{duration}</CustomText>
              )}
            </View>
            {preferences && preferences?.length > 0 && (
              <View style={styles.preferencesContainer}>
                <CustomText style={styles.preferencesText}>{preferences?.join(', ')} </CustomText>
              </View>
            )}

          </View>
        </View>
        {isShowBookButton && (
          <CustomButton
            title={t('providerDetails.book')}
            onPress={onBook}
            buttonStyle={styles.bookButton}
            buttonTextStyle={styles.bookButtonText}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.whitetext}
            paddingHorizontal={theme.SW(24)}
          />
        )}
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: SW(15),
      paddingVertical: SH(16),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      minWidth: 0,
    },
    iconContainer: {
      width: SF(40),
      height: SF(40),
      borderRadius: SF(20),
      backgroundColor: Colors.secondary || '#E3F2FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SW(12),
    },
    infoContainer: {
      flex: 1,
      minWidth: 0,
      marginRight: SW(8),
    },
    nameBlock: {
      marginBottom: SH(4),
    },
    serviceName: {
      fontSize: SF(15),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      lineHeight: SF(20),
    },
    offerBadge: {
      alignSelf: 'flex-start',
      backgroundColor: Colors.gray || '#135D96',
      paddingHorizontal: SW(8),
      paddingVertical: SH(1),
      borderRadius: SF(4),
      marginBottom: SH(4),
    },
    offerBadgeText: {
      fontSize: SF(11),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.white,
    },
    originalPrice: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
      textDecorationLine: 'line-through',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    price: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    duration: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    bookButton: {
      borderRadius: SF(6),
      paddingVertical: SH(4),
      paddingHorizontal: SW(0),
      height: SH(30),
      width: SW(90),
      flexShrink: 0,
      marginTop: SH(2),
    },
    bookButtonText: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
    },
    serviceImage: {
      width: '100%',
      height: '100%',
    },
    serviceImageContainer: {
      width: SW(60),
      height: SH(60),
      borderRadius: SF(30),
      marginRight: SW(12),
      overflow: 'hidden',
    },
    preferencesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    preferencesText: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
  });
};
