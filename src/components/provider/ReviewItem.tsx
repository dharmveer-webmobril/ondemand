import { View, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader } from '@components/common';
import StarRating from 'react-native-star-rating-widget';
import imagePaths from '@assets';

type ReviewItemProps = {
  id: string;
  userName: string;
  userImage?: string;
  rating: number;
  reviewText: string;
  timeAgo: string;
  isVerified?: boolean;
};

export default function ReviewItem({
  userName,
  userImage,
  rating,
  reviewText,
  timeAgo,
  isVerified = false,
}: ReviewItemProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ImageLoader
          source={userImage ? { uri: userImage } : imagePaths.no_image}
          mainImageStyle={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <CustomText style={styles.userName} numberOfLines={1}>
              {userName}
            </CustomText>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <CustomText style={styles.verifiedText}>
                  {t('common.verifiedUser')}
                </CustomText>
              </View>
            ) : null}
          </View>
          <View style={styles.starsRow}>
            <StarRating
              rating={rating}
              onChange={() => {}}
              starSize={theme.SF(14)}
              color="#FAAC00"
              readOnly
            />
          </View>
        </View>
        {timeAgo ? (
          <CustomText style={styles.timeAgo}>{timeAgo}</CustomText>
        ) : null}
      </View>

      <CustomText style={styles.reviewText}>{reviewText}</CustomText>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    card: {
      backgroundColor: Colors.white,
      marginHorizontal: SW(16),
      marginBottom: SH(10),
      paddingHorizontal: SW(14),
      paddingVertical: SH(14),
      borderRadius: SF(12),
      borderWidth: 1,
      borderColor: Colors.border || '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: SH(10),
    },
    avatar: {
      width: SF(40),
      height: SF(40),
      borderRadius: SF(20),
      marginRight: SW(12),
    },
    userInfo: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(4),
    },
    userName: {
      flexShrink: 1,
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginRight: SW(8),
    },
    starsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    verifiedBadge: {
      backgroundColor: Colors.secondary || '#E3F2FD',
      paddingHorizontal: SW(6),
      paddingVertical: SH(2),
      borderRadius: SF(4),
    },
    verifiedText: {
      fontSize: SF(10),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    timeAgo: {
      marginLeft: SW(8),
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.textAppColor || Colors.text,
    },
    reviewText: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      lineHeight: SF(20),
    },
  });
};
