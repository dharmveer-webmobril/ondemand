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

interface ContainerProps {
  children: React.ReactNode;
  safeArea?: boolean;
  statusBarColor?: string;
  barStyle?: "light-content" | "dark-content";
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

const Container: React.FC<ContainerProps> = ({
  children,
  safeArea = true,
  statusBarColor = "#FFFFFF",
  barStyle = "dark-content",
  style,
  edges = ["top", "bottom"],
}) => {
  const isAndroid = Platform.OS === "android";

  return safeArea ? (
    <>
      <StatusBar
        translucent
        backgroundColor={statusBarColor}
        barStyle={barStyle}
      />

      <SafeAreaView style={[{flex:1},style]}>
        {children}
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
        {children}
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
