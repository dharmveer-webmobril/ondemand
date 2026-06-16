import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useThemeContext } from '@utils/theme';
import {
  SPLASH_TEXT_DELAY_MS,
  SPLASH_TEXT_FADE_MS,
} from './splashTiming';

const TITLE = 'Squedio';

export default function SplashBrandTitle() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(37);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(
      SPLASH_TEXT_DELAY_MS,
      withTiming(1, { duration: SPLASH_TEXT_FADE_MS, easing }),
    );
    translateY.value = withDelay(
      SPLASH_TEXT_DELAY_MS,
      withTiming(0, { duration: SPLASH_TEXT_FADE_MS, easing }),
    );
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.title, animatedStyle]}>{TITLE}</Animated.Text>
  );
}

const createStyles = (theme: ReturnType<typeof useThemeContext>) =>
  StyleSheet.create({
    title: {
      marginTop: theme.SH(10),
      color: theme.colors.whitetext,
      fontSize: theme.SF(30),
      fontFamily: theme.fonts.Kanit_SemiBold,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
  });
