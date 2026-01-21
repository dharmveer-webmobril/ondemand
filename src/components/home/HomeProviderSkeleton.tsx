import { View, FlatList, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { Shimmer } from '@components/common';

const ProviderSkeletonItem = () => {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Shimmer
                width="100%"
                height="100%"
                borderRadius={theme.SF(25)}
              />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Shimmer
              width={theme.SW(100)}
              height={theme.SF(15)}
              borderRadius={4}
            />
            <View style={styles.serviceTypeContainer}>
              <Shimmer
                width={theme.SW(80)}
                height={theme.SF(11)}
                borderRadius={4}
              />
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Shimmer
            width={theme.SW(80)}
            height={theme.SF(14)}
            borderRadius={4}
          />
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <Shimmer
            width={theme.SW(14)}
            height={theme.SF(14)}
            borderRadius={4}
          />
          <Shimmer
            width={theme.SW(150)}
            height={theme.SF(11)}
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

  // Render 3 skeleton items
  const skeletonData = Array.from({ length: 3 }, (_, i) => ({ id: `skeleton-${i}` }));

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={skeletonData}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={() => (
          <ProviderSkeletonItem />
        )}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SW, SF, SH } = theme;
  return StyleSheet.create({
    container: {
      marginTop: -SH(35),
    },
    listContent: {
      paddingHorizontal: SW(18),
      paddingRight: SW(20),
      marginVertical: SH(8),
      paddingTop: SH(15),
    },
    cardContainer: {
      width: SW(220),
      marginRight: SW(16),
      backgroundColor: Colors.white,
      borderRadius: SF(16),
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    content: {
      padding: SW(12),
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(12),
    },
    profileImageContainer: {
      position: 'relative',
      marginRight: SW(10),
    },
    profileImageWrapper: {
      width: SF(50),
      height: SF(50),
      borderRadius: SF(25),
      borderWidth: 1,
      borderColor: Colors.primary,
      overflow: 'hidden',
    },
    profileInfo: {
      flex: 1,
    },
    serviceTypeContainer: {
      marginTop: SH(4),
    },
    ratingSection: {
      marginBottom: SH(10),
    },
    addressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(6),
    },
  });
};
