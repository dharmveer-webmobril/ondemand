import { View, StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
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
  likes?: number;
  dislikes?: number;
  onLike?: () => void;
  onDislike?: () => void;
  onReport?: () => void;
};

export default function ReviewItem({
  id,
  userName,
  userImage,
  rating,
  reviewText,
  timeAgo,
  isVerified = false,
  likes = 0,
  dislikes = 0,
  onLike,
  onDislike,
  onReport,
}: ReviewItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageLoader
          source={userImage ? { uri: userImage } : imagePaths.no_image}
          mainImageStyle={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <CustomText style={styles.userName}>{userName}</CustomText>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <CustomText style={styles.verifiedText}>Verified User</CustomText>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <CustomText style={styles.timeAgo}>{timeAgo}</CustomText>
            <StarRating
              rating={rating}
              onChange={() => {}}
              starSize={theme.SF(14)}
              color="#FAAC00"
              readOnly
            />
          </View>
        </View>
      </View>

      <CustomText style={styles.reviewText}>{reviewText}</CustomText>

      <View style={styles.actions}>
        <View style={styles.reactionContainer}>
          <Pressable
            onPress={onLike}
            style={({ pressed }) => [
              styles.reactionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <VectoreIcons
              name="thumbs-up"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.textAppColor || theme.colors.text}
            />
            <CustomText style={styles.reactionCount}>{likes}</CustomText>
          </Pressable>
          <Pressable
            onPress={onDislike}
            style={({ pressed }) => [
              styles.reactionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <VectoreIcons
              name="thumbs-down"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.textAppColor || theme.colors.text}
            />
            <CustomText style={styles.reactionCount}>{dislikes}</CustomText>
          </Pressable>
        </View>
        {onReport && (
          <Pressable
            onPress={onReport}
            style={({ pressed }) => [
              styles.reportButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <CustomText style={styles.reportText}>Report</CustomText>
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
      backgroundColor: Colors.white,
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    header: {
      flexDirection: 'row',
      marginBottom: SH(12),
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
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginRight: SW(8),
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
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    timeAgo: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    reviewText: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      lineHeight: SF(20),
      marginBottom: SH(12),
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reactionContainer: {
      flexDirection: 'row',
      gap: SW(16),
    },
    reactionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(4),
    },
    reactionCount: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.textAppColor || Colors.text,
    },
    reportButton: {
      paddingHorizontal: SW(12),
      paddingVertical: SH(4),
    },
    reportText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.red || '#FF0000',
    },
  });
};

