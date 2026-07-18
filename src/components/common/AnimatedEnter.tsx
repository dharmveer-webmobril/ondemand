import React, { useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { withDelay, withTiming } from 'react-native-reanimated';
import { ENTER_EASING, SCREEN_ENTER_MS, staggerDelay } from '@utils/animations';

type AnimatedEnterVariant = 'fade' | 'up';

type AnimatedEnterProps = {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  variant?: AnimatedEnterVariant;
  disabled?: boolean;
};

export default function AnimatedEnter({
  children,
  index = 0,
  style,
  variant = 'up',
  disabled = false,
}: AnimatedEnterProps) {
  const delay = staggerDelay(index);
  const offset = variant === 'fade' ? 8 : 16;

  // Slide-up only entrance (no opacity change). Keeping opacity at 1 avoids the
  // Android bug where an elevated card's shadow renders as a solid black box
  // while its opacity animates — and it needs no offscreen/hardware-texture
  // compositing, so the card's shadow is never clipped on the sides.
  const entering = useCallback(
    () => {
      'worklet';
      return {
        initialValues: {
          transform: [{ translateY: offset }],
        },
        animations: {
          transform: [
            {
              translateY: withDelay(
                delay,
                withTiming(0, {
                  duration: SCREEN_ENTER_MS,
                  easing: ENTER_EASING,
                }),
              ),
            },
          ],
        },
      };
    },
    [delay, offset],
  );

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
