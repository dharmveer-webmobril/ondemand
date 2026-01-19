import { View, StyleSheet, Pressable, FlatList, RefreshControl } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { ImageLoader, VectoreIcons } from '@components/common';

type PortfolioGridProps = {
  images: string[];
  onImagePress?: (index: number) => void;
  refreshControl?: React.ReactElement<RefreshControl>;
};

export default function PortfolioGrid({ images, onImagePress, refreshControl }: PortfolioGridProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderImage = ({ item, index }: { item: string; index: number }) => {
    return (
      <Pressable
        onPress={() => onImagePress && onImagePress(index)}
        style={({ pressed }) => [
          styles.imageContainer,
          pressed && { opacity: 0.8 },
        ]}
      >
        <ImageLoader
          source={{ uri: item }}
          mainImageStyle={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <VectoreIcons
            name="heart-outline"
            icon="Ionicons"
            size={theme.SF(20)}
            color={theme.colors.whitetext}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item, index) => `portfolio-${index}`}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background || '#F5F5F5',
    },
    grid: {
      padding: SW(10),
    },
    row: {
      justifyContent: 'space-between',
    },
    imageContainer: {
      width: '48%',
      aspectRatio: 1,
      marginBottom: SH(10),
      borderRadius: SF(12),
      overflow: 'hidden',
      backgroundColor: Colors.white,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      bottom: SF(8),
      right: SF(8),
      width: SF(32),
      height: SF(32),
      borderRadius: SF(16),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

