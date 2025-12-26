import { View, StyleSheet, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';

export interface ChatListItemData {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  image: any;
  isGroup?: boolean;
}

interface ChatListItemProps {
  item: ChatListItemData;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export default function ChatListItem({ item, onPress, onOptionsPress }: ChatListItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <ImageLoader
        source={item.image}
        mainImageStyle={styles.profileImage}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <CustomText style={styles.nameText}>{item.name}</CustomText>
          <CustomText style={styles.lastMessageText} numberOfLines={1}>
            {item.lastMessage}
          </CustomText>
          <CustomText style={styles.timestampText}>{item.timestamp}</CustomText>
        </View>
        <View style={styles.rightContainer}>
          <Pressable
            style={styles.optionsButton}
            onPress={onOptionsPress}
          >
            <VectoreIcons
              name="ellipsis-vertical"
              size={theme.SF(20)}
              icon="Ionicons"
              color={theme.colors.lightText}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(12),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary || '#EAEAEA',
  },
  profileImage: {
    width: theme.SF(60),
    height: theme.SF(60),
    borderRadius: theme.SF(30),
    marginRight: theme.SW(12),
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.SEMI_BOLD,
    marginBottom: theme.margins.sm,
  },
  lastMessageText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: theme.SH(50),
  },
  timestampText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
    marginBottom: theme.margins.sm,
  },
  optionsButton: {
    padding: theme.SF(4),
  },
});

