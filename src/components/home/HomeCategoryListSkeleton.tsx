import { View, FlatList, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';
import { HOME_CARD_SHADOW, HOME_HORIZONTAL_PADDING } from './homeLayout';

const CATEGORY_BOX_SIZE = 82;

const CategorySkeletonItem = ({ boxSize }: { boxSize: number }) => {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.itemContainer}>
      <View style={[styles.shimmerBox, HOME_CARD_SHADOW, { width: boxSize, height: boxSize }]}>
        <Shimmer width="100%" height="100%" borderRadius={theme.SF(12)} />
      </View>
      <View style={styles.textContainer}>
        <Shimmer width={theme.SW(56)} height={theme.SF(12)} borderRadius={4} />
      </View>
    </View>
  );
};

export default function HomeCategoryListSkeleton() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const boxSize = theme.SF(CATEGORY_BOX_SIZE);

  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={skeletonData}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={() => (
          <View style={styles.itemWrapper}>
            <CategorySkeletonItem boxSize={boxSize} />
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SW, SF, SH } = theme;
  const boxSize = SF(CATEGORY_BOX_SIZE);

  return StyleSheet.create({
    container: {
      paddingHorizontal: SW(HOME_HORIZONTAL_PADDING),
      marginTop: SH(10),
    },
    listContent: {
      paddingRight: SW(4),
    },
    itemWrapper: {
      marginRight: SW(14),
    },
    itemContainer: {
      alignItems: 'center',
      width: boxSize,
    },
    shimmerBox: {
      borderRadius: SF(12),
      overflow: 'hidden',
    },
    textContainer: {
      marginTop: SH(8),
      alignItems: 'center',
      width: boxSize,
    },
  });
};
