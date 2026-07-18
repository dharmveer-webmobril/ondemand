import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  PRESS_DURATION_MS,
  PRESS_EASING,
  PRESS_SCALE,
  RELEASE_DURATION_MS,
} from '@utils/animations';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export default function AnimatedPressable({
  children,
  style,
  disabled,
  onPressIn,
  onPressOut,
  scaleTo = PRESS_SCALE,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: any) => {
      if (!disabled) {
        scale.value = withTiming(scaleTo, {
          duration: PRESS_DURATION_MS,
          easing: PRESS_EASING,
        });
      }
      onPressIn?.(event);
    },
    [disabled, onPressIn, scale, scaleTo],
  );

  const handlePressOut = useCallback(
    (event: any) => {
      scale.value = withTiming(1, {
        duration: RELEASE_DURATION_MS,
        easing: PRESS_EASING,
      });
      onPressOut?.(event);
    },
    [onPressOut, scale],
  );

  return (
    <AnimatedPressableBase
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
