import React, { useState, useCallback } from "react";
import { StatusBar, View, StyleSheet } from "react-native";
import { HomeHeader, HomeMainList } from "@components";

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // TODO: Add API calls here when ready
      // Example:
      // await Promise.all([
      //   refetchCategories(),
      //   refetchNearestProviders(),
      //   refetchSliderData(),
      // ]);
      
      // Simulate API call delay
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <HomeHeader />
      <HomeMainList refreshing={refreshing} onRefresh={onRefresh} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
