import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';

const FeaturedSkeletonItem = () => {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Shimmer width="100%" height="100%" borderRadius={theme.SF(12)} />
    </View>
  );
};

export default function HomeFeaturedServicesSkeleton() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const data = Array.from({ length: 3 }, (_, index) => ({
    id: `featured-skeleton-${index}`,
  }));

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={item => item.id}
      renderItem={() => <FeaturedSkeletonItem />}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: theme.SW(16),
      paddingBottom: theme.SH(4),
    },
    separator: {
      width: theme.SW(12),
    },
    card: {
      width: theme.SW(260),
      height: theme.SH(140),
      borderRadius: theme.SF(12),
      overflow: 'hidden',
    },
  });

