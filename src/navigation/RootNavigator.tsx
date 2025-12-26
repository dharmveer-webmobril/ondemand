import React from "react";
import MainNavigator from "./MainNavigator";
import { View } from "react-native";

export default function RootNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <MainNavigator />
    </View>
  );
}
