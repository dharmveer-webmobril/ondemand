import { View, StyleSheet, Pressable } from 'react-native'
import { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';

interface ChatHeaderProps {
  name: string;
  lastSeen?: string;
  time?: string;
  image?: any;
  onBackPress: () => void;
  onCallPress?: () => void;
  onOptionsPress?: () => void;
  bookingId?: string;
}

export default function ChatHeader({
  bookingId,
  name,
  time,
  image,
  onBackPress,
}: ChatHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={onBackPress}>
        <VectoreIcons
          name="arrow-back"
          size={theme.SF(24)}
          icon="Ionicons"
          color={theme.colors.text}
        />
      </Pressable>
      {image && (
        <ImageLoader
          source={image}
          mainImageStyle={styles.profileImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.infoContainer}>
        <CustomText style={styles.nameText}>{name}</CustomText>
        {bookingId && (
          <CustomText style={styles.lastSeenText}>
            {bookingId}
          </CustomText>
        )}
        {time && (
          <CustomText style={styles.timeText}>{time}</CustomText>
        )}
      </View>
      {/* 
        <View style={styles.rightContainer}>
          {onCallPress && (
            <Pressable style={styles.iconButton} onPress={onCallPress}>
              <VectoreIcons
                name="call-outline"
                size={theme.SF(24)}
                icon="Ionicons"
                color={theme.colors.text}
              />
            </Pressable>
          )}
          <Pressable style={styles.iconButton} onPress={onOptionsPress}>
            <VectoreIcons
              name="ellipsis-vertical"
              size={theme.SF(24)}
              icon="Ionicons"
              color={theme.colors.text}
            />
          </Pressable>
        </View> 
      */}
    </View>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SW(10),
    paddingVertical: theme.SH(8),
    backgroundColor: theme.colors.white,
    borderBottomColor: theme.colors.secondary || '#EAEAEA',
  },
  backButton: {
    padding: theme.SF(8),
    marginRight: theme.SW(7),
  },
  profileImage: {
    width: theme.SF(50),
    height: theme.SF(50),
    borderRadius: theme.SF(25),
    marginRight: theme.SW(8),
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.BOLD,
    marginBottom: theme.SF(2),
  },
  lastSeenText: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
    marginBottom: theme.SF(2),
  },
  timeText: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.SF(8),
  },
});

