import { View, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';

export default function HomeSliderSkeleton() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <Shimmer
          width="100%"
          height="100%"
          borderRadius={10}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SW, SF } = theme;
  return StyleSheet.create({
    container: {
      paddingHorizontal: SW(20),
    },
    slide: {
      height: SF(160),
      borderRadius: SF(10),
      overflow: 'hidden',
      backgroundColor: theme.colors.secondary,
    },
  });
};
