import React from 'react';
import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
} from 'react-native-keyboard-controller';

/**
 * Wrap modal sheets / bottom overlays that contain inputs.
 */
export default function KeyboardModalAvoiding({
  children,
  style,
  behavior = 'padding',
  automaticOffset = false,
  keyboardVerticalOffset = 0,
  ...rest
}: KeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior}
      automaticOffset={automaticOffset}
      keyboardVerticalOffset={keyboardVerticalOffset}
      {...rest}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
