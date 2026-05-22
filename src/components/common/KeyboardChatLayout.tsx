import React, { useMemo } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeType, useThemeContext } from '@utils/theme';

type Props = {
  children: React.ReactNode;
  footer: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Chat-style layout: scrollable messages + pinned footer that moves with the keyboard.
 * Avoids the transparent gap that KeyboardStickyView can leave above the keyboard.
 */
export default function KeyboardChatLayout({ children, footer, style }: Props) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { isVisible: isKeyboardVisible } = useKeyboardState();

  const footerPaddingBottom = isKeyboardVisible
    ? theme.SH(8)
    : Math.max(insets.bottom, theme.SH(8));

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[styles.root, style]}
      keyboardVerticalOffset={0}
    >
      <View style={styles.column}>
        <View style={styles.main}>{children}</View>
        <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
          {footer}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    column: {
      flex: 1,
    },
    main: {
      flex: 1,
      minHeight: 0,
    },
    footer: {
      backgroundColor: theme.colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.secondary || '#E5E7EB',
    },
  });
