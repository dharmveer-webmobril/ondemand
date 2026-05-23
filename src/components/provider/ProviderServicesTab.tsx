import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceItem from './ServiceItem';
import ProviderEmptyState from './ProviderEmptyState';
import imagePaths from '@assets';
import { Shimmer } from '@components/common';

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
  preferences?: string[];
  routineConfig?: { enabled?: boolean };
};

/** Get the offer with the highest discount value from activeOffers */
function getBestOffer(
  activeOffers: Offer[] | undefined | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
): { title: string; discountValue: number } | null {
  if (!Array.isArray(activeOffers) || activeOffers.length === 0) return null;
  let best: { title: string; discountValue: number } | null = null;
  for (const offer of activeOffers) {
    if (offer == null) continue;
    const value = Number(offer?.discountValue) || 0;
    if (value > 0 && (best == null || value > best.discountValue)) {
      best = {
        title: offer?.title ?? t('providerDetails.offerFallback'),
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
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const skeletonData = useMemo(() => Array.from({ length: 6 }, (_, i) => `skeleton-${i}`), []);

  if (isLoading && !refreshing && services.length === 0) {
    return (
      <FlatList
        data={skeletonData}
        keyExtractor={(item) => item}
        renderItem={() => (
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonLeft}>
              <Shimmer
                width={theme.SW(60)}
                height={theme.SH(60)}
                borderRadius={theme.SF(30)}
              />
              <View style={styles.skeletonTextCol}>
                <Shimmer
                  width={theme.SW(150)}
                  height={theme.SH(14)}
                  borderRadius={theme.SF(8)}
                />
                <Shimmer
                  width={theme.SW(120)}
                  height={theme.SH(12)}
                  borderRadius={theme.SF(8)}
                  style={styles.skeletonGap}
                />
                <Shimmer
                  width={theme.SW(170)}
                  height={theme.SH(10)}
                  borderRadius={theme.SF(8)}
                  style={styles.skeletonGap}
                />
              </View>
            </View>
            <Shimmer
              width={theme.SW(90)}
              height={theme.SH(30)}
              borderRadius={theme.SF(6)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  if (services.length === 0) {
    return (
      <ProviderEmptyState
        message={t('providerDetails.reviews.noServices')}
      />
    );
  }

  // Sort so services with highest discount offer appear first
  const sortedServices :any= [...services].sort((a, b) => {
    const bestA = getBestOffer(a?.activeOffers, t);
    const bestB = getBestOffer(b?.activeOffers, t);
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
        const bestOffer = getBestOffer(item?.activeOffers, t);
        return (
          <ServiceItem
            showPreferences={item?.preferences}
            id={item._id}
            name={item.name ?? ''}
            image={item.images?.[0] ? { uri: item.images[0] } : imagePaths.no_image}
            price={Number(item?.price) || 0}
            duration={formatDuration ? formatDuration(item?.time) : undefined}
            icon="cut"
            onBook={() => onBookService(item._id)}
            isShowBookButton={isShowBookButton}
            bestOffer={bestOffer}
            routineConfig={item?.routineConfig}
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
  const { SH, SW } = theme;
  return StyleSheet.create({
    listContent: {
      paddingBottom: SH(20),
    },
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SW(15),
      paddingVertical: SH(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray || '#E0E0E0',
      backgroundColor: theme.colors.white,
    },
    skeletonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    skeletonTextCol: {
      marginLeft: SW(12),
      flex: 1,
    },
    skeletonGap: {
      marginTop: SH(8),
    },
  });
};
