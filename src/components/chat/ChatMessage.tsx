import { View, StyleSheet } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader } from '@components/common';

export interface ChatMessageData {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  image?: any;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme, message.isOwn), [theme, message.isOwn]);

  return (
    <View style={styles.container}>
      {!message.isOwn && message.image && (
        <ImageLoader
          source={message.image}
          mainImageStyle={styles.avatar}
          resizeMode="cover"
        />
      )}
      <View style={styles.messageContainer}>
        <View style={styles.bubble}>
          <CustomText style={styles.messageText}>{message.text}</CustomText>
        </View>
        <CustomText style={styles.timestampText}>{message.timestamp}</CustomText>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType, isOwn: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: theme.SH(12),
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    paddingHorizontal: theme.SW(20),
  },
  avatar: {
    width: theme.SF(30),
    height: theme.SF(30),
    borderRadius: theme.SF(15),
    marginRight: theme.SW(8),
    alignSelf: 'flex-end',
  },
  messageContainer: {
    maxWidth: '75%',
    alignItems: isOwn ? 'flex-end' : 'flex-start',
  },
  bubble: {
    backgroundColor: isOwn ? theme.colors.primary : theme.colors.secondary || '#EAEAEA',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.SW(12),
    paddingVertical: theme.SH(8),
    borderBottomLeftRadius: isOwn ? theme.borderRadius.lg : theme.borderRadius.sm,
    borderBottomRightRadius: isOwn ? theme.borderRadius.sm : theme.borderRadius.lg,
  },
  messageText: {
    fontSize: theme.fontSize.sm,
    color: isOwn ? theme.colors.white : theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
  },
  timestampText: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
    marginTop: theme.SH(4),
  },
});

