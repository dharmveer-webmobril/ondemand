import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CustomText, CustomButton, ImageLoader } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import imagePaths from '@assets';
import { getStatusLabel } from '@utils/tools';

type BookingCardProps = {
  bookingId?: string;
  friendName?: string;
  status: string;
  statusColor?: string;
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
  status,
  statusColor,
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

  const badgeColor = statusColor || theme.colors.text;
  const statusLabel = getStatusLabel(status);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      android_ripple={{ color: theme.colors.gray || '#F0F0F0' }}
    >
      {/* Left: Image (~1/3) */}
      <View style={styles.imageWrapper}>
        <ImageLoader
          source={image}
          mainImageStyle={styles.image}
          resizeMode="cover"
          fallbackImage={imagePaths.barber1}
        />
      </View>

      {/* Right: Details (~2/3) */}
      <View style={styles.contentWrapper}>
        {/* Status badge top right */}
        <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
          <CustomText
            fontSize={theme.fontSize.xxs}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.white}
          >
            {statusLabel}{" "}
          </CustomText>
        </View>

        {/* Booking ID */}
        <CustomText
          fontSize={theme.fontSize.xxs}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText || '#999999'}
        >
          {t('myBookingScreen.bookingId')}
        </CustomText>
        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
          style={styles.bookingIdText}
        >
          {bookingId || '—'}
        </CustomText>

        {/* Date */}
        <CustomText
          fontSize={theme.fontSize.xxs}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText || '#999999'}
          style={styles.detailLine}
        >
          {date},   {time}
        </CustomText>
        {/* Time */}

        {/* Service Provider */}
        <CustomText
          fontSize={theme.fontSize.xxs}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText || '#999999'}
          style={styles.detailLine}
        >
          {shopName}
        </CustomText>
        {/* Address */}
        <CustomText
          fontSize={theme.fontSize.xxs}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText || '#999999'}
          numberOfLines={2}
          style={styles.detailLine}
        >
          {address}
        </CustomText>

        {/* Footer: Price + Book Again */}
        <View style={styles.footerRow}>
          <CustomText
            fontSize={theme.fontSize.lg || 18}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.primary || '#135D96'}
          >
            {price}
          </CustomText>
          {status === 'completed' && onBookAgain && (
            <CustomButton
              title={t('myBookingScreen.bookAgain')}
              onPress={onBookAgain}
              backgroundColor={theme.colors.primary || '#135D96'}
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
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      backgroundColor: '#F8F8F8',
      borderRadius: theme.borderRadius.lg || 16,
      marginBottom: theme.SH(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      overflow: 'hidden',
    },
    imageWrapper: {
      width: theme.SW(80),
      height: theme.SW(80),
      aspectRatio: 1,
      backgroundColor: theme.colors.white,
      borderRadius: theme.SW(80) / 2,
      overflow: 'hidden',
      marginLeft: theme.SW(12),
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: theme.borderRadius.md || 10,
    },
    contentWrapper: {
      flex: 1,
      paddingVertical: theme.SH(12),
      paddingHorizontal: theme.SW(14),
      paddingRight: theme.SW(12),
    },
    statusBadge: {
      position: 'absolute',
      top: theme.SH(0),
      right: theme.SW(0),
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderRadius: theme.borderRadius.sm || 6,
      zIndex: 1,
    },
    bookingIdText: {
      marginTop: theme.SH(2),
    },
    detailLine: {
      marginTop: theme.SH(4),
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // marginTop: theme.SH(12),
      paddingTop: theme.SH(8),
    },
    bookAgainButton: {
      height: theme.SH(36),
      paddingHorizontal: theme.SW(16),
      borderRadius: theme.borderRadius.md || 8,
    },
    buttonText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.white,
    },
  });
