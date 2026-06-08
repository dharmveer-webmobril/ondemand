import React, { useCallback } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CustomText } from '@components/common';
import {
  GLASS_BORDER,
  GLASS_OVERLAY,
  HOME_FLOATING_SHADOW,
  LIQUID_RELEASE_SPRING,
  LIQUID_SPRING,
  SKY_GRADIENT_COLORS,
  SKY_GRADIENT_LOCATIONS,
} from './bentoEffects';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GlassSkyButtonProps = {
  onPress: () => void;
  size?: number;
  borderRadius?: number;
  icon: React.ReactNode;
  showAiBadge?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function GlassSkyButton({
  onPress,
  size = 48,
  borderRadius = 14,
  icon,
  showAiBadge = false,
  style,
  accessibilityLabel,
}: GlassSkyButtonProps) {
  const scale = useSharedValue(1);
  const float = useSharedValue(0);

  React.useEffect(() => {
    float.value = withSpring(1, { damping: 16, stiffness: 90 });
  }, [float]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: (1 - float.value) * 6 },
    ],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.94, LIQUID_SPRING);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, LIQUID_RELEASE_SPRING);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.shell,
        HOME_FLOATING_SHADOW,
        {
          width: size,
          height: size,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={[...SKY_GRADIENT_COLORS]}
        locations={[...SKY_GRADIENT_LOCATIONS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      <View style={[styles.glassSheen, GLASS_OVERLAY, { borderRadius }]} />
      <View style={[styles.glassBorder, GLASS_BORDER, { borderRadius }]} />
      <View style={styles.content}>
        {icon}
        {showAiBadge ? (
          <View style={styles.aiBadge}>
            <CustomText style={styles.aiBadgeText}>AI</CustomText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.35)',
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.4,
  },
});
