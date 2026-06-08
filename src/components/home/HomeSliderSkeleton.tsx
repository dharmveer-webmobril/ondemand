import { View, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';
import { HOME_CARD_SHADOW, HOME_HORIZONTAL_PADDING } from './homeLayout';

export default function HomeSliderSkeleton() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={[styles.slide, HOME_CARD_SHADOW]}>
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
      paddingHorizontal: SW(HOME_HORIZONTAL_PADDING),
    },
    slide: {
      height: SF(120),
      borderRadius: SF(10),
      overflow: 'hidden',
      backgroundColor: theme.colors.secondary,
    },
  });
};
