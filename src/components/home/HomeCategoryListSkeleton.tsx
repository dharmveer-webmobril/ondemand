import { View, FlatList, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';

const CategorySkeletonItem = () => {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.imageLoader}>
        <Shimmer
          width="100%"
          height="100%"
          borderRadius={theme.SF(29)}
        />
      </View>
      <View style={styles.textContainer}>
        <Shimmer
          width={theme.SW(60)}
          height={theme.SF(12)}
          borderRadius={4}
        />
      </View>
    </View>
  );
};

export default function HomeCategoryListSkeleton() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Render 6 skeleton items
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}` }));

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={skeletonData}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={() => (
          <View style={styles.itemWrapper}>
            <CategorySkeletonItem />
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SW, SF, SH } = theme;
  return StyleSheet.create({
    container: {
      paddingHorizontal: SW(20),
      alignSelf: 'center',
      marginTop: -SH(15),
    },
    listContent: {
      paddingRight: SW(20),
    },
    itemWrapper: {
      marginRight: SW(15),
    },
    itemContainer: {
      alignItems: 'center',
    },
    imageLoader: {
      height: SF(58),
      width: SF(58),
      borderRadius: SF(58) / 2,
      borderWidth: 1,
      borderColor: Colors.primary,
      overflow: 'hidden',
    },
    textContainer: {
      marginTop: SH(5),
      alignItems: 'center',
      maxWidth: SW(80),
    },
  });
};
