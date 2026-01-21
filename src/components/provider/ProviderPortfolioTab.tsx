import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import PortfolioGrid from './PortfolioGrid';
import ProviderEmptyState from './ProviderEmptyState';
import { RefreshControl } from 'react-native';

type ProviderPortfolioTabProps = {
  images: string[];
  isFetching?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onImagePress?: (index: number) => void;
};

export default function ProviderPortfolioTab({
  images,
  isFetching = false,
  refreshing = false,
  onRefresh,
  onImagePress,
}: ProviderPortfolioTabProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (images.length === 0) {
    return <ProviderEmptyState message="No portfolio images available" />;
  }

  return (
    <PortfolioGrid
      images={images}
      onImagePress={onImagePress || ((index) => console.log('Image pressed:', index))}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isFetching}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary || '#135D96']}
        />
      }
    />
  );
}

const createStyles = (theme: ThemeType) => {
  return StyleSheet.create({});
};
