// src/components/Container.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ENTER_EASING, SCREEN_ENTER_MS } from '@utils/animations';

interface ContainerProps {
  children: React.ReactNode;
  safeArea?: boolean;
  statusBarColor?: string;
  barStyle?: "light-content" | "dark-content";
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
  /** Screen content entrance animation (default on). */
  animate?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  safeArea = true,
  statusBarColor = "#FFFFFF",
  barStyle = "dark-content",
  style,
  edges = ["top", "bottom"],
  animate = true,
}) => {
  const isAndroid = Platform.OS === "android";

  const content = animate ? (
    <Animated.View
      entering={FadeIn.duration(SCREEN_ENTER_MS).easing(ENTER_EASING)}
      style={{ flex: 1 }}
      renderToHardwareTextureAndroid={isAndroid}
    >
      {children}
    </Animated.View>
  ) : (
    children
  );

  return safeArea ? (
    <>
      <StatusBar
        translucent
        backgroundColor={statusBarColor}
        barStyle={barStyle}
      />

      <SafeAreaView style={[{flex:1},style]} edges={['top', 'bottom']}>
        {content}
      </SafeAreaView>
    </>
  ) : (
    <>
      <StatusBar
        translucent
        backgroundColor={statusBarColor}
        barStyle={barStyle}
      />

      <View
        style={[
          styles.container,
          style,
        ]}
      >
        {content}
      </View>
    </>
  );
};

export default Container;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Android needs padding when not using SafeArea
  androidStatusBarFix: {
    paddingTop: StatusBar.currentHeight,
  },
});
