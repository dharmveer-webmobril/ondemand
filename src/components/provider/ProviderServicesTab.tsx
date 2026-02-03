import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceItem from './ServiceItem';
import ProviderEmptyState from './ProviderEmptyState';
import imagePaths from '@assets';

type Offer = {
  _id: string;
  title?: string;
  discountValue?: number;
  discountType?: string;
};

type Service = {
  _id: string;
  name: string;
  price: number;
  time?: number;
  images?: string[];
  activeOffers?: Offer[];
};

/** Get the offer with the highest discount value from activeOffers */
function getBestOffer(activeOffers: Offer[] | undefined | null): { title: string; discountValue: number } | null {
  if (!Array.isArray(activeOffers) || activeOffers.length === 0) return null;
  let best: { title: string; discountValue: number } | null = null;
  for (const offer of activeOffers) {
    if (offer == null) continue;
    const value = Number(offer?.discountValue) || 0;
    if (value > 0 && (best == null || value > best.discountValue)) {
      best = {
        title: offer?.title ?? 'Offer',
        discountValue: Math.min(100, Math.max(0, value)),
      };
    }
  }
  return best;
}

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

  // Sort so services with highest discount offer appear first
  const sortedServices = [...services].sort((a, b) => {
    const bestA = getBestOffer(a?.activeOffers);
    const bestB = getBestOffer(b?.activeOffers);
    const valueA = bestA?.discountValue ?? 0;
    const valueB = bestB?.discountValue ?? 0;
    return valueB - valueA;
  });

  return (
    <FlatList
      data={sortedServices}
      keyExtractor={(item) => item?._id ?? ''}
      renderItem={({ item }) => {
        if (item == null) return null;
        const bestOffer = getBestOffer(item?.activeOffers);
        return (
          <ServiceItem
            id={item._id}
            name={item.name ?? ''}
            image={item.images?.[0] ? { uri: item.images[0] } : imagePaths.no_image}
            price={Number(item?.price) || 0}
            duration={formatDuration ? formatDuration(item?.time) : undefined}
            icon="cut"
            onBook={() => onBookService(item._id)}
            isShowBookButton={isShowBookButton}
            bestOffer={bestOffer}
          />
        );
      }}
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
