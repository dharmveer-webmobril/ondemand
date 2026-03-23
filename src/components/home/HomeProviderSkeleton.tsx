import { View, FlatList, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';

const COVER_HEIGHT = 128;
const AVATAR_SIZE = 56;

const ProviderSkeletonItem = () => {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const overlap = AVATAR_SIZE / 2;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.coverSection}>
        <View style={styles.coverImageClip}>
          <Shimmer
            width="100%"
            height={COVER_HEIGHT}
            borderRadius={0}
          />
        </View>
        <View style={[styles.avatarWrap, { bottom: -overlap }]}>
          <Shimmer
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            borderRadius={AVATAR_SIZE / 2}
          />
        </View>
      </View>

      <View style={[styles.bottomSection, { paddingTop: overlap + theme.SH(6) }]}>
        <Shimmer
          width={theme.SW(180)}
          height={theme.SF(16)}
          borderRadius={4}
          style={styles.nameShimmer}
        />
        <View style={styles.metaRow}>
          <View style={styles.addressBlock}>
            <Shimmer
              width={theme.SF(16)}
              height={theme.SF(16)}
              borderRadius={4}
            />
            <View style={styles.addressLines}>
              <Shimmer
                width="100%"
                height={theme.SF(12)}
                borderRadius={4}
              />
              <Shimmer
                width="70%"
                height={theme.SF(12)}
                borderRadius={4}
                style={styles.addressLine2}
              />
            </View>
          </View>
          <Shimmer
            width={theme.SW(36)}
            height={theme.SF(14)}
            borderRadius={4}
          />
        </View>
      </View>
    </View>
  );
};

export default function HomeProviderSkeleton() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const skeletonData = Array.from({ length: 4 }, (_, i) => ({
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
        renderItem={() => <ProviderSkeletonItem />}
      />
    </View>
  );
};

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SW, SF, SH } = theme;

  return StyleSheet.create({
    container: {},
    listContent: {
      paddingHorizontal: SW(18),
      paddingRight: SW(20),
      marginVertical: SH(8),
      paddingTop: SH(4),
    },
    cardContainer: {
      width: SW(260),
      marginRight: SW(14),
      backgroundColor: Colors.white,
      borderRadius: SF(16),
      overflow: 'visible',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    coverSection: {
      position: 'relative',
    },
    coverImageClip: {
      height: COVER_HEIGHT,
      borderTopLeftRadius: SF(16),
      borderTopRightRadius: SF(16),
      overflow: 'hidden',
    },
    avatarWrap: {
      position: 'absolute',
      right: SW(12),
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 3,
      borderColor: Colors.white,
      overflow: 'hidden',
      backgroundColor: Colors.white,
      zIndex: 2,
      elevation: 6,
    },
    bottomSection: {
      paddingHorizontal: SW(12),
      paddingBottom: SH(12),
    },
    nameShimmer: {
      marginBottom: SH(8),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: SW(8),
    },
    addressBlock: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(4),
      minWidth: 0,
    },
    addressLines: {
      flex: 1,
    },
    addressLine2: {
      marginTop: SH(4),
    },
  });
};
