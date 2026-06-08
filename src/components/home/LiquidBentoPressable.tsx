import React, { useCallback } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  HOME_BENTO_RADIUS,
  HOME_BENTO_SHADOW,
  LIQUID_RELEASE_SPRING,
  LIQUID_SPRING,
} from './bentoEffects';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type LiquidBentoPressableProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  index?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  borderRadius?: number;
  /** Wrap children in squared bento shell (category tiles). Off for full cards. */
  bentoSurface?: boolean;
};

export default function LiquidBentoPressable({
  children,
  onPress,
  style,
  contentStyle,
  index = 0,
  disabled = false,
  accessibilityLabel,
  borderRadius = HOME_BENTO_RADIUS,
  bentoSurface = true,
}: LiquidBentoPressableProps) {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);

  const animatedShell = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedRipple = useAnimatedStyle(() => ({
    opacity: ripple.value * 0.4,
    transform: [{ scale: 0.94 + ripple.value * 0.06 }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, LIQUID_SPRING);
    ripple.value = withSpring(1, LIQUID_SPRING);
  }, [ripple, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, LIQUID_RELEASE_SPRING);
    ripple.value = withSpring(0, LIQUID_RELEASE_SPRING);
  }, [ripple, scale]);

  const surfaceStyle = [
    bentoSurface ? styles.bentoTile : styles.contentSurface,
    !bentoSurface && styles.contentSurfaceVisible,
    bentoSurface ? HOME_BENTO_SHADOW : null,
    { borderRadius },
    contentStyle,
  ];

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 55)
        .springify()
        .damping(LIQUID_SPRING.damping)
        .stiffness(LIQUID_SPRING.stiffness)}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[animatedShell, style]}
      >
        <View style={surfaceStyle}>
          {children}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.waterRipple,
              { borderRadius },
              animatedRipple,
            ]}
          />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bentoTile: {
    overflow: 'hidden',
  },
  contentSurface: {
    overflow: 'hidden',
  },
  contentSurfaceVisible: {
    overflow: 'visible',
  },
  waterRipple: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(125, 211, 252, 0.5)',
  },
});
