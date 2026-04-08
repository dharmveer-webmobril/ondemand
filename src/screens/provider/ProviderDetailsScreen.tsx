import { StyleSheet, Linking, Alert, RefreshControl, View } from 'react-native';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, Shimmer, showToast } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ProviderTabs from '@components/provider/ProviderTabs';
import ProviderErrorState from '@components/provider/ProviderErrorState';
import ProviderServicesTab from '@components/provider/ProviderServicesTab';
import ProviderReviewsTab from '@components/provider/ProviderReviewsTab';
import ProviderPortfolioTab from '@components/provider/ProviderPortfolioTab';
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import ServiceForModal from '@components/provider/ServiceForModal';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  ProviderHeader,
  ProviderSubHeader,
  ProviderDetails,
  ProviderMembersList,
} from '@components';
import {
  useGetServiceProviderDetail,
  useGetServiceProviderServices,
  useGetFavoriteServiceProviders,
  useAddFavoriteServiceProvider,
  useRemoveFavoriteServiceProvider,
} from '@services/index';
import { formatAddress } from '@utils/tools';
import { SafeAreaView } from 'react-native-safe-area-context';
import localStorage from '@utils/StorageProvider';

type TabType = 'services' | 'reviews' | 'portfolio' | 'details';

// Mock data - Replace with actual API calls
const mockReviews = [
  {
    id: '1',
    userName: 'Guy Hawkins',
    rating: 5,
    reviewText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timeAgo: '1 week ago',
    isVerified: true,
    likes: 10,
    dislikes: 3,
  },
  {
    id: '2',
    userName: 'John Doe',
    rating: 4,
    reviewText: 'Great service and professional staff. Highly recommended!',
    timeAgo: '2 weeks ago',
    isVerified: false,
    likes: 5,
    dislikes: 0,
  },
];

const ratingDistribution = [
  { stars: 5, percentage: 75, count: 150 },
  { stars: 4, percentage: 21, count: 42 },
  { stars: 3, percentage: 3, count: 6 },
  { stars: 2, percentage: 1, count: 2 },
  { stars: 1, percentage: 0, count: 0 },
];

export default function ProviderDetailsScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const prevScreenFlag = route.params?.prevScreenFlag;
  // Get spId from route params - could be provider.id or provider._id or direct spId
  const spId =
    route.params?.provider?.id ||
    route.params?.provider?._id ||
    route.params?.spId ||
    route.params?.providerId;
  const isShowBookButton = prevScreenFlag === 'without_data';
  const [bookingDetails, setBookingDetails] = useState<{
    deliveryMode?: any;
    serviceFor?: any;
  }>({ deliveryMode: null, serviceFor: null });
  console.log('spId--------isShowBookButton', isShowBookButton);
  // Fetch provider details and services
  const {
    data: providerData,
    isLoading: isLoadingProvider,
    isFetching: isFetchingProvider,
    isError: isErrorProvider,
    error: providerError,
    refetch: refetchProvider,
  } = useGetServiceProviderDetail(spId);

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    isError: isErrorServices,
    error: servicesError,
    refetch: refetchServices,
  } = useGetServiceProviderServices(spId, bookingDetails.deliveryMode);

  const [refreshing, setRefreshing] = useState(false);
  const [showDeliveryModeModal, setShowDeliveryModeModal] = useState(false);
  const [showServiceForModal, setShowServiceForModal] = useState(false);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null,
  );

  const { data: favoriteProviders = [] } = useGetFavoriteServiceProviders();
  const addFavorite = useAddFavoriteServiceProvider();
  const removeFavorite = useRemoveFavoriteServiceProvider();

  // Extract provider data from API response
  const provider = providerData?.ResponseData || {};
  const services = servicesData?.ResponseData?.services || [];
  const businessProfile = provider?.businessProfile || {};

  console.log('services--------services', services);
  const isLoading = isLoadingProvider || isLoadingServices;
  const isFetching = isFetchingProvider || isFetchingServices;
  const isError = isErrorProvider || isErrorServices;
  const { t } = useTranslation();
  const showTopSkeleton = isLoadingProvider && !provider?._id;

  const pendingService = useMemo(
    () =>
      pendingServiceId
        ? services.find((s: any) => s._id === pendingServiceId)
        : null,
    [pendingServiceId, services],
  );

  const pendingDeliveryModes = useMemo(() => {
    const raw = pendingService?.preferences;
    if (!Array.isArray(raw)) return [];
    return raw.filter((p: string) =>
      ['atHome', 'online', 'onPremises'].includes(p),
    );
  }, [pendingService]);

  const providerIdForFavorite = provider?._id || spId;
  const isFavoriteFromDetail = Boolean(
    provider?.isFavorite ??
      provider?.isBookmarked ??
      provider?.favorite ??
      provider?.isFavourite,
  );
  const isFavoriteFromList = useMemo(() => {
    if (!providerIdForFavorite) return false;
    return favoriteProviders.some(p => p._id === providerIdForFavorite);
  }, [favoriteProviders, providerIdForFavorite]);

  const favoriteBaseline =
    isFavoriteFromDetail || isFavoriteFromList;
  const favoriteShown =
    optimisticFavorite !== null ? optimisticFavorite : favoriteBaseline;

  useEffect(() => {
    setOptimisticFavorite(null);
  }, [spId]);

  const handleFavoriteToggle = useCallback(
    async (next: boolean) => {
      if (!spId) return;
      setOptimisticFavorite(next);
      try {
        if (next) {
          await addFavorite.mutateAsync(spId);
        } else {
          await removeFavorite.mutateAsync(spId);
        }
        setOptimisticFavorite(null);
        showToast({
          type: 'success',
          message: next
            ? t('favoriteProviders.added')
            : t('favoriteProviders.removed'),
        });
      } catch {
        setOptimisticFavorite(null);
        showToast({
          type: 'error',
          message: t('favoriteProviders.toggleError'),
        });
      }
    },
    [spId, addFavorite, removeFavorite, t],
  );

  const errorMessage =
    providerError?.message ||
    servicesError?.message ||
    t('providerDetails.failedToLoadProvider');

  const handleBookService = async (serviceId: string) => {
    await localStorage.removeItem('bookingId');
    const service = services.find((s: any) => s._id === serviceId);
    const modes = (service?.preferences || []).filter((p: string) =>
      ['atHome', 'online', 'onPremises'].includes(p),
    );
    if (modes.length === 0) {
      showToast({
        type: 'info',
        message: t('providerDetails.serviceNotAvailableMode'),
      });
      return;
    }
    setPendingServiceId(serviceId);
    setShowDeliveryModeModal(true);
  };

  const handleDeliveryModeConfirm = (deliveryMode: any) => {
    const service = services.find((s: any) => s._id === pendingServiceId);

    if (
      service?.preferences?.length > 0 &&
      service?.preferences.includes(deliveryMode)
    ) {
      navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
        providerId: provider._id || spId,
        serviceId: pendingServiceId,
        services: services,
        selectedServices: [service],
        bookingDetails: { deliveryMode },
        providerData: provider,
      });
    } else {
      showToast({
        type: 'info',
        message: t('providerDetails.serviceNotAvailableMode'),
      });
      return;
    }

    // setBookingDetails((prev) => ({ ...prev, deliveryMode }));
    // If "at_home" is selected, show ServiceForModal
    // if (deliveryMode === 'atHome') {
    //   setShowDeliveryModeModal(false);
    //   setShowServiceForModal(true);
    // } else {
    //   navigateToBookAppointment(deliveryMode);
    // }
  };

  const handleServiceForConfirm = (serviceFor: 'self' | 'other') => {
    setBookingDetails(prev => ({ ...prev, serviceFor }));
    setShowServiceForModal(false);
    navigateToBookAppointment(
      bookingDetails.deliveryMode,
      bookingDetails.serviceFor,
    );
  };

  const navigateToBookAppointment = (deliveryMode: any, serviceFor?: any) => {
    if (!pendingServiceId) return;
    const bookingData = {
      deliveryMode,
      ...(serviceFor && { serviceFor }),
    };
    console.log(
      'deliveryMode--------navigateToBookAppointment',
      deliveryMode,
      serviceFor,
    );
    console.log('deliveryMode--------pendingServiceId', bookingData, services);
    console.log('deliveryMode--------bookingData', pendingServiceId);

    // navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
    //   providerId: provider._id || spId,
    //   serviceId: pendingServiceId,
    //   services: services,
    //   bookingDetails: bookingData,
    // });

    // // Reset state
    // setPendingServiceId(null);
    // setBookingDetails({});
  };

  const handleServiceFeePress = () => {
    navigate(SCREEN_NAMES.SERVICE_FEE_POLICY);
  };

  const handlePaymentPolicyPress = () => {
    navigate(SCREEN_NAMES.TERMS_AND_CONDITIONS, {
      type: 'Cancel Policies',
    });
  };

  const handleReportPress = () => {
    navigate(SCREEN_NAMES.REPORT, { providerId: provider._id || spId });
  };

  const handleCall = () => {
    if (provider.contact) {
      const url = `tel:${provider.contact}`;
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(t('common.error'), t('common.phoneNotSupported'));
          }
        })
        .catch(() => {
          Alert.alert(t('common.error'), t('common.unableToCall'));
        });
    }
  };

  useEffect(() => {
    console.log('bookingDetails--------useEffect', bookingDetails);
    refetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchServices]);
  const handleRetry = useCallback(() => {
    refetchProvider();
    refetchServices();
  }, [refetchProvider, refetchServices]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProvider(), refetchServices()]);
    } catch (error) {
      console.error('Error refreshing provider data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProvider, refetchServices]);

  // Format duration from minutes to "30m" format
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '';
    return `${minutes}m`;
  };

  const renderContent = () => {
    if (isError && !providerData?.ResponseData) {
      return (
        <ProviderErrorState errorMessage={errorMessage} onRetry={handleRetry} />
      );
    }

    switch (activeTab) {
      case 'services':
        return (
          <ProviderServicesTab
            services={services}
            isLoading={isLoading}
            isFetching={isFetchingServices}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onBookService={handleBookService}
            // isShowBookButton={!isShowBookButton}
            formatDuration={formatDuration}
          />
        );
      case 'reviews':
        return (
          <ProviderReviewsTab
            reviews={mockReviews}
            overallRating={provider.rating || 0}
            ratingDistribution={ratingDistribution}
            isFetching={isFetching}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onReport={handleReportPress}
          />
        );
      case 'portfolio':
        return (
          <ProviderPortfolioTab
            images={businessProfile.portfolioImages || []}
            isFetching={isFetching}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onImagePress={index => console.log('Image pressed:', index)}
          />
        );
      case 'details':
        return (
          <ProviderDetails
            aboutUs={
              businessProfile.description ||
              t('providerDetails.noDescriptionAvailable')
            }
            phoneNumber={provider.contact || ''}
            onCall={handleCall}
            facebookUrl={
              businessProfile.websiteAndSocialLinks?.facebook || undefined
            }
            instagramUrl={
              businessProfile.websiteAndSocialLinks?.instagram || undefined
            }
            websiteUrl={
              businessProfile.websiteAndSocialLinks?.website || undefined
            }
            amenities={[]} // TODO: Map amenitiesIds to actual amenities
            onServiceFeePress={handleServiceFeePress}
            onPaymentPolicyPress={handlePaymentPolicyPress}
            onReportPress={handleReportPress}
            membersSection={<ProviderMembersList spId={spId} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isFetching}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary || '#135D96']}
              />
            }
          />
        );
      default:
        return null;
    }
  };

  if (isError && !providerData?.ResponseData) {
    return (
      <Container safeArea={true} style={styles.container}>
        <ProviderErrorState
          errorMessage={errorMessage}
          onRetry={handleRetry}
          fullScreen={true}
        />
      </Container>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      {showTopSkeleton ? (
        <View style={styles.topSkeletonWrap}>
          <View style={styles.headerSkeletonRow}>
            <Shimmer width={theme.SF(56)} height={theme.SF(56)} borderRadius={theme.SF(28)} />
            <View style={styles.headerTextSkeleton}>
              <Shimmer width={'70%'} height={theme.SH(14)} borderRadius={theme.SF(8)} />
              <Shimmer width={'45%'} height={theme.SH(12)} borderRadius={theme.SF(8)} style={styles.skeletonGap} />
            </View>
          </View>

          <View style={styles.subHeaderSkeleton}>
            <Shimmer width={'100%'} height={theme.SH(12)} borderRadius={theme.SF(8)} />
            <Shimmer width={'70%'} height={theme.SH(12)} borderRadius={theme.SF(8)} style={styles.skeletonGap} />
          </View>

          <View style={styles.tabsSkeletonRow}>
            <Shimmer width={'23%'} height={theme.SH(34)} borderRadius={theme.SF(18)} />
            <Shimmer width={'23%'} height={theme.SH(34)} borderRadius={theme.SF(18)} />
            <Shimmer width={'23%'} height={theme.SH(34)} borderRadius={theme.SF(18)} />
            <Shimmer width={'23%'} height={theme.SH(34)} borderRadius={theme.SF(18)} />
          </View>
        </View>
      ) : (
        <>
          <ProviderHeader
            name={provider.name || t('providerDetails.providerDefaultName')}
            logo={provider.profileImage}
          />
          <ProviderSubHeader
            logo={provider.profileImage}
            name={provider.name || t('providerDetails.providerDefaultName')}
            address={
              formatAddress({
                line1: provider.businessProfile?.line1,
                line2: provider.businessProfile?.line2,
                landmark: provider.businessProfile?.landmark,
                pincode: provider.businessProfile?.pincode,
                city: provider.businessProfile?.city?.name,
                country: provider.businessProfile?.country?.name,
              }) ||
              provider.city?.name ||
              t('providerDetails.addressNotAvailable')
            }
            serviceType={
              businessProfile.name || t('providerDetails.serviceProviderDefault')
            }
            rating={provider.rating || undefined}
            reviewCount={0} // TODO: Get from API if available
            onShare={() => console.log('Share pressed')}
            isFavorite={favoriteShown}
            onFavorite={handleFavoriteToggle}
          />
          <ProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
      {renderContent()}
      {/* {isShowBookButton && services.length > 0 && (
        <ProviderBookButton
          onPress={() => handleBookService(services[0]._id)}
        />
      )} */}

      {/* Delivery Mode Modal */}
      <DeliveryModeModal
        visible={showDeliveryModeModal}
        onClose={() => {
          setShowDeliveryModeModal(false);
          setPendingServiceId(null);
        }}
        onConfirm={handleDeliveryModeConfirm}
        selectedMode={bookingDetails.deliveryMode}
        availableModes={
          pendingServiceId ? pendingDeliveryModes : undefined
        }
      />

      {/* Service For Modal (shown when "At Home" is selected) */}
      <ServiceForModal
        visible={showServiceForModal}
        onClose={() => {
          setShowServiceForModal(false);
          setPendingServiceId(null);
          setBookingDetails({});
        }}
        onConfirm={handleServiceForConfirm}
        selectedServiceFor={bookingDetails.serviceFor}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    topSkeletonWrap: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(10),
      paddingBottom: theme.SH(8),
      backgroundColor: Colors.white,
    },
    headerSkeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTextSkeleton: {
      flex: 1,
      marginLeft: theme.SW(12),
    },
    subHeaderSkeleton: {
      marginTop: theme.SH(14),
    },
    tabsSkeletonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.SH(14),
    },
    skeletonGap: {
      marginTop: theme.SH(8),
    },
  });
};
