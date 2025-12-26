import { View, StyleSheet, TextInput, Pressable } from 'react-native'
import React, { useMemo, useState } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { VectoreIcons } from '@components/common';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCameraPress?: () => void;
  onAttachmentPress?: () => void;
}

export default function ChatInput({ onSend, onCameraPress, onAttachmentPress }: ChatInputProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.iconButton} onPress={onCameraPress}>
        <VectoreIcons
          name="camera-outline"
          size={theme.SF(24)}
          icon="Ionicons"
          color={theme.colors.lightText}
        />
      </Pressable>
      <TextInput
        style={styles.input}
        placeholder={t('chat.inputPlaceholder')}
        placeholderTextColor={theme.colors.lightText}
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <Pressable style={styles.iconButton} onPress={onAttachmentPress}>
        <VectoreIcons
          name="attach-outline"
          size={theme.SF(24)}
          icon="Ionicons"
          color={theme.colors.lightText}
        />
      </Pressable>
      <Pressable style={styles.sendButton} onPress={handleSend}>
        <VectoreIcons
          name="send"
          size={theme.SF(20)}
          icon="Ionicons"
          color={theme.colors.white}
        />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SW(16),
    paddingVertical: theme.SH(10),
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary || '#EAEAEA',
  },
  iconButton: {
    padding: theme.SF(8),
    marginRight: theme.SW(8),
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
    maxHeight: theme.SH(100),
    paddingHorizontal: theme.SW(12),
    paddingVertical: theme.SH(8),
    backgroundColor: theme.colors.secondary || '#F5F5F5',
    borderRadius: theme.borderRadius.lg,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.SF(20),
    width: theme.SF(40),
    height: theme.SF(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.SW(8),
  },
});

