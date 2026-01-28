import { StyleSheet, Linking, Alert, RefreshControl } from 'react-native';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, showToast } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ProviderTabs from '@components/provider/ProviderTabs';
import ProviderDetails from '@components/provider/ProviderDetails';
import ProviderLoadingState from '@components/provider/ProviderLoadingState';
import ProviderErrorState from '@components/provider/ProviderErrorState';
import ProviderServicesTab from '@components/provider/ProviderServicesTab';
import ProviderReviewsTab from '@components/provider/ProviderReviewsTab';
import ProviderPortfolioTab from '@components/provider/ProviderPortfolioTab';
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import ServiceForModal from '@components/provider/ServiceForModal';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { ProviderHeader, ProviderSubHeader } from '@components';
import { useGetServiceProviderDetail, useGetServiceProviderServices } from '@services/index';

type TabType = 'services' | 'reviews' | 'portfolio' | 'details';

// Mock data - Replace with actual API calls
const mockReviews = [
  {
    id: '1',
    userName: 'Guy Hawkins',
    rating: 5,
    reviewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
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
  const spId = route.params?.provider?.id || route.params?.provider?._id || route.params?.spId || route.params?.providerId;
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
    refetch: refetchProvider
  } = useGetServiceProviderDetail(spId);

  const {
    data: servicesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    isError: isErrorServices,
    error: servicesError,
    refetch: refetchServices
  } = useGetServiceProviderServices(spId, bookingDetails.deliveryMode);

  const [refreshing, setRefreshing] = useState(false);
  const [showDeliveryModeModal, setShowDeliveryModeModal] = useState(false);
  const [showServiceForModal, setShowServiceForModal] = useState(false);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);

  // Extract provider data from API response
  const provider = providerData?.ResponseData || {};
  const services = servicesData?.ResponseData?.services || [];
  const businessProfile = provider?.businessProfile || {};

  const isLoading = isLoadingProvider || isLoadingServices;
  const isFetching = isFetchingProvider || isFetchingServices;
  const isError = isErrorProvider || isErrorServices;
  const { t } = useTranslation();
  const errorMessage = providerError?.message || servicesError?.message || t('providerDetails.failedToLoadProvider');

  const handleBookService = (serviceId: string) => {
    setPendingServiceId(serviceId);
    setShowDeliveryModeModal(true);
  };

  const handleDeliveryModeConfirm = (deliveryMode: any) => {

    const service = services.find((s: any) => s._id === pendingServiceId);
    console.log('deliveryMode--------service', service);
    console.log('deliveryMode--------deliveryMode', deliveryMode);
    if (service?.preferences?.length > 0 && service?.preferences.includes(deliveryMode)) {
      navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
        providerId: provider._id || spId,
        serviceId: pendingServiceId,
        services: services,
        selectedServices: [service],
        bookingDetails: { deliveryMode },
        providerData: provider,
      });
      console.log('deliveryMode--------service yes show service for modal', service);
    } else {
      showToast({ type: 'info', message: t('providerDetails.serviceNotAvailableMode') });
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
    setBookingDetails((prev) => ({ ...prev, serviceFor }));
    setShowServiceForModal(false);
    navigateToBookAppointment(bookingDetails.deliveryMode, bookingDetails.serviceFor);
  };

  const navigateToBookAppointment = (
    deliveryMode: any,
    serviceFor?: any
  ) => {
    if (!pendingServiceId) return;
    const bookingData = {
      deliveryMode,
      ...(serviceFor && { serviceFor }),
    };
    console.log('deliveryMode--------navigateToBookAppointment', deliveryMode, serviceFor);
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
    navigate(SCREEN_NAMES.PAYMENT_POLICY);
  };

  const handleReportPress = () => {
    navigate(SCREEN_NAMES.REPORT, { providerId: provider._id || spId });
  };

  const handleCall = () => {
    if (provider.contact) {
      const url = `tel:${provider.contact}`;
      Linking.canOpenURL(url)
        .then((supported) => {
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
      await Promise.all([
        refetchProvider(),
        refetchServices()
      ]);
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
    // Show initial loading only on first load, not during refetch
    if (isLoading && !refreshing) {
      return <ProviderLoadingState />;
    }

    if (isError && !providerData?.ResponseData) {
      return (
        <ProviderErrorState
          errorMessage={errorMessage}
          onRetry={handleRetry}
        />
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
            onImagePress={(index) => console.log('Image pressed:', index)}
          />
        );
      case 'details':
        return (
          <ProviderDetails
            aboutUs={businessProfile.description || 'No description available'}
            phoneNumber={provider.contact || ''}
            onCall={handleCall}
            facebookUrl={businessProfile.websiteAndSocialLinks?.facebook || undefined}
            instagramUrl={businessProfile.websiteAndSocialLinks?.instagram || undefined}
            websiteUrl={businessProfile.websiteAndSocialLinks?.website || undefined}
            amenities={[]} // TODO: Map amenitiesIds to actual amenities
            onServiceFeePress={handleServiceFeePress}
            onPaymentPolicyPress={handlePaymentPolicyPress}
            onReportPress={handleReportPress}
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

  // Don't render content if loading or error - show full screen loader/error
  // Only show full screen loader on initial load, not during refetch
  if (isLoading && !refreshing && !providerData?.ResponseData) {
    return (
      <Container safeArea={true} style={styles.container}>
        <ProviderLoadingState fullScreen={true} />
      </Container>
    );
  }

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
    <Container safeArea={true} style={styles.container}>
      <ProviderHeader
        name={provider.name || 'Provider'}
        logo={provider.profileImage}
      />
      <ProviderSubHeader
        logo={provider.profileImage}
        name={provider.name || 'Provider'}
        address={businessProfile.address || provider.city?.name || 'Address not available'}
        serviceType={businessProfile.name || 'Service Provider'}
        rating={provider.rating || undefined}
        reviewCount={0} // TODO: Get from API if available
        onShare={() => console.log('Share pressed')}
        onFavorite={(isFavorite: any) => console.log('Favorite:', isFavorite)}
      />
      <ProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
  });
};

