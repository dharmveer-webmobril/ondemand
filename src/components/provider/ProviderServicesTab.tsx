import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceItem from './ServiceItem';
import ProviderEmptyState from './ProviderEmptyState';
import imagePaths from '@assets';

type Service = {
  _id: string;
  name: string;
  price: number;
  time?: number;
};

type ProviderServicesTabProps = {
  services: Service[];
  isLoading?: boolean;
  isFetching?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBookService: (serviceId: string) => void;
  isShowBookButton?: boolean;
  formatDuration?: (minutes: number | undefined) => string;
};

export default function ProviderServicesTab({
  services,
  isLoading = false,
  isFetching = false,
  refreshing = false,
  onRefresh,
  onBookService,
  isShowBookButton = true,
  formatDuration,
}: ProviderServicesTabProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isLoading && !refreshing) {
    return null; // Let parent handle initial loading
  }

  if (services.length === 0) {
    return <ProviderEmptyState message="No services available" />;
  }

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <ServiceItem
          id={item._id}
          name={item.name}
          image={item.images?.[0] ? { uri: item.images?.[0] } : imagePaths.no_image}
          price={item.price}
          duration={formatDuration ? formatDuration(item.time) : undefined}
          icon="cut"
          onBook={() => onBookService(item._id)}
          isShowBookButton={isShowBookButton}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isFetching}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary || '#135D96']}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const createStyles = (theme: ThemeType) => {
  const { SH } = theme;
  return StyleSheet.create({
    listContent: {
      paddingBottom: SH(20),
    },
  });
};
