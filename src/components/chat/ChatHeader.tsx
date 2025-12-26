import { View, StyleSheet, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  name: string;
  lastSeen?: string;
  time?: string;
  image?: any;
  onBackPress: () => void;
  onCallPress?: () => void;
  onOptionsPress?: () => void;
}

export default function ChatHeader({
  name,
  lastSeen,
  time,
  image,
  onBackPress,
  onCallPress,
  onOptionsPress,
}: ChatHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

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
        {lastSeen && (
          <CustomText style={styles.lastSeenText}>
            {t('chat.lastSeen', { time: lastSeen })}
          </CustomText>
        )}
        {time && (
          <CustomText style={styles.timeText}>{time}</CustomText>
        )}
      </View>
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
    </View>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SW(16),
    paddingVertical: theme.SH(12),
    backgroundColor: theme.colors.white,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.secondary || '#EAEAEA',
  },
  backButton: {
    padding: theme.SF(8),
    marginRight: theme.SW(8),
  },
  profileImage: {
    width: theme.SF(60),
    height: theme.SF(60),
    borderRadius: theme.SF(30),
    marginRight: theme.SW(12),
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
    fontSize: theme.fontSize.xs,
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
    marginLeft: theme.SW(8),
  },
});

