import React, { forwardRef } from 'react';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@utils/theme';

export type KeyboardFormScrollProps = KeyboardAwareScrollViewProps & {
  /** Extra space between keyboard and focused field (includes bottom safe area by default). */
  bottomOffset?: number;
};

/**
 * Standard form scroll wrapper — use on any screen with text inputs.
 * Works with app-wide KeyboardProvider on iOS and Android.
 */
const KeyboardFormScroll = forwardRef<
  KeyboardAwareScrollViewRef,
  KeyboardFormScrollProps
>(function KeyboardFormScroll(
  {
    bottomOffset,
    keyboardShouldPersistTaps = 'handled',
    showsVerticalScrollIndicator = false,
    children,
    ...rest
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const theme = useThemeContext();
  const resolvedBottomOffset =
    bottomOffset ?? theme.SH(20) + Math.max(insets.bottom, theme.SH(8));

  return (
    <KeyboardAwareScrollView
      ref={ref}
      bottomOffset={resolvedBottomOffset}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
});

export default KeyboardFormScroll;
