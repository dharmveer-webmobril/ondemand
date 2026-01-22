import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CustomText, CustomButton, ImageLoader } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import imagePaths from '@assets';

type BookingStatus = 'COMPLETED' | 'ONGOING' | 'UPCOMING';

type BookingCardProps = {
  bookingId?: string;
  friendName?: string;
  status: BookingStatus;
  date: string;
  time: string;
  shopName: string;
  address: string;
  price: string;
  image?: any;
  onBookAgain?: () => void;
  onPress?: () => void;
};

export default function BookingCard({
  bookingId,
  friendName,
  status,
  date,
  time,
  shopName,
  address,
  price,
  image,
  onBookAgain,
  onPress,
}: BookingCardProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50'; // Green
      case 'ONGOING':
        return '#009BFF'; // Light blue
      case 'UPCOMING':
        return '#FF9800'; // Orange
      default:
        return theme.colors.text;
    }
  };

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      android_ripple={{ color: theme.colors.gray || '#F5F5F5' }}
    >
      {/* Image container with status badge overlay */}
      <View style={styles.imageContainer}>
        <ImageLoader
          source={image || imagePaths.barber1}
          mainImageStyle={styles.image}
          resizeMode="cover"
          fallbackImage={imagePaths.barber1}
        />
        {/* Status badge in top right corner */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <CustomText
            fontSize={theme.fontSize.xxs}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.white}
          >
            {status}
          </CustomText>
        </View>
      </View>

      {/* Content below image */}
      <View style={styles.contentContainer}>
        {/* Header with booking ID or friend name */}
        <View style={styles.headerRow}>
          {bookingId && (
            <View style={styles.titleContainer}>
              <CustomText
                fontSize={theme.fontSize.xxs}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText || '#999999'}
              >
                Booking ID
              </CustomText>
              <CustomText
                fontSize={theme.fontSize.xs}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                marginTop={theme.SH(2)}
              >
                {bookingId}
              </CustomText>
            </View>
          )}
          {friendName && (
            <View style={styles.titleContainer}>
              <CustomText
                fontSize={theme.fontSize.xs}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
              >
                {friendName}
              </CustomText>
            </View>
          )}
        </View>

        {/* Booking details */}
        <View style={styles.detailsContainer}>
          <CustomText
            fontSize={theme.fontSize.xs}
            fontFamily={theme.fonts.MEDIUM}
            color={theme.colors.text}
            marginTop={theme.SH(4)}
          >
            {shopName}
          </CustomText>
          
          <CustomText
            fontSize={theme.fontSize.xxs}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText || '#999999'}
            marginTop={theme.SH(2)}
            numberOfLines={2}
          >
            {address}
          </CustomText>

          <CustomText
            fontSize={theme.fontSize.xxs}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.text}
            marginTop={theme.SH(4)}
          >
            {date}, {time}
          </CustomText>
        </View>

        {/* Footer with price and button */}
        <View style={styles.footerRow}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.primary || '#135D96'}
          >
            {price}
          </CustomText>
          {status === 'COMPLETED' && onBookAgain && (
            <CustomButton
              title={t('myBookingScreen.bookAgain')}
              onPress={onBookAgain}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              buttonStyle={styles.bookAgainButton}
              buttonTextStyle={styles.buttonText}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      width: '48%',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.SH(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: theme.SH(140),
      position: 'relative',
      backgroundColor: theme.colors.gray || '#F5F5F5',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    statusBadge: {
      position: 'absolute',
      top: theme.SH(8),
      right: theme.SW(8),
      paddingHorizontal: theme.SW(8),
      paddingVertical: theme.SH(4),
      borderRadius: theme.borderRadius.sm,
      zIndex: 1,
    },
    contentContainer: {
      padding: theme.SW(12),
    },
    headerRow: {
      marginBottom: theme.SH(4),
    },
    titleContainer: {
      flex: 1,
    },
    detailsContainer: {
      marginTop: theme.SH(4),
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.SH(8),
      paddingTop: theme.SH(8),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray || '#E0E0E0',
    },
    bookAgainButton: {
      height: theme.SH(28),
      paddingHorizontal: theme.SW(12),
      borderRadius: theme.borderRadius.md,
    },
    buttonText: {
      fontSize: theme.fontSize.xxs,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.white,
    },
  });

