import { StyleSheet, FlatList, View, ActivityIndicator, Linking, Alert, RefreshControl } from 'react-native';
import React, { useMemo, useState, useCallback } from 'react';
import { useRoute, } from '@react-navigation/native';
import { Container, CustomText, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ProviderTabs from '@components/provider/ProviderTabs';
import ServiceItem from '@components/provider/ServiceItem';
import RatingChart from '@components/provider/RatingChart';
import ReviewItem from '@components/provider/ReviewItem';
import PortfolioGrid from '@components/provider/PortfolioGrid';
import ProviderDetails from '@components/provider/ProviderDetails';
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

  // Get spId from route params - could be provider.id or provider._id or direct spId
  const spId = route.params?.provider?.id || route.params?.provider?._id || route.params?.spId || route.params?.providerId;

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
  } = useGetServiceProviderServices(spId);

  const [refreshing, setRefreshing] = useState(false);

  // Extract provider data from API response
  const provider = providerData?.ResponseData || {};
  const services = servicesData?.ResponseData?.services || [];
  const businessProfile = provider?.businessProfile || {};

  const isLoading = isLoadingProvider || isLoadingServices;
  const isFetching = isFetchingProvider || isFetchingServices;
  const isError = isErrorProvider || isErrorServices;
  const errorMessage = providerError?.message || servicesError?.message || 'Failed to load provider details';

  const handleBookService = (serviceId: string) => {
    navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
      providerId: provider._id || spId,
      serviceId,
    });
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
            Alert.alert('Error', 'Phone calls are not supported on this device');
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Unable to make phone call');
        });
    }
  };

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
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText}
            style={{ marginTop: theme.SH(12) }}
          >
            Loading provider details...
          </CustomText>
        </View>
      );
    }

    if (isError && !providerData?.ResponseData) {
      return (
        <View style={styles.errorContainer}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.red}
            textAlign="center"
            style={{ marginBottom: theme.SH(8) }}
          >
            {errorMessage}
          </CustomText>
          <CustomButton
            title="Retry"
            onPress={handleRetry}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            buttonStyle={styles.retryButton}
          />
        </View>
      );
    }

    switch (activeTab) {
      case 'services':
        if (services.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
                textAlign="center"
              >
                No services available
              </CustomText>
            </View>
          );
        }
        return (
          <FlatList
            data={services}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ServiceItem
                id={item._id}
                name={item.name}
                price={item.price}
                duration={formatDuration(item.time)}
                icon="cut"
                onBook={() => handleBookService(item._id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isFetchingServices}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary || '#135D96']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        );
      case 'reviews':
        return (
          <FlatList
            data={mockReviews}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <RatingChart
                overallRating={provider.rating || 0}
                ratingDistribution={ratingDistribution}
              />
            }
            renderItem={({ item }) => (
              <ReviewItem
                id={item.id}
                userName={item.userName}
                rating={item.rating}
                reviewText={item.reviewText}
                timeAgo={item.timeAgo}
                isVerified={item.isVerified}
                likes={item.likes}
                dislikes={item.dislikes}
                onReport={handleReportPress}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isFetching}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary || '#135D96']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        );
      case 'portfolio':
        const portfolioImages = businessProfile.portfolioImages || [];
        if (portfolioImages.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
                textAlign="center"
              >
                No portfolio images available
              </CustomText>
            </View>
          );
        }
        return (
          <PortfolioGrid
            images={portfolioImages}
            onImagePress={(index) => console.log('Image pressed:', index)}
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
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText}
            style={{ marginTop: theme.SH(12) }}
          >
            Loading provider details...
          </CustomText>
        </View>
      </Container>
    );
  }

  if (isError && !providerData?.ResponseData) {
    return (
      <Container safeArea={true} style={styles.container}>
        <View style={styles.fullScreenError}>
          <CustomText
            fontSize={theme.fontSize.lg}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.red}
            textAlign="center"
            style={{ marginBottom: theme.SH(8) }}
          >
            Error Loading Provider
          </CustomText>
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.lightText}
            textAlign="center"
            style={{ marginBottom: theme.SH(20) }}
          >
            {errorMessage}
          </CustomText>
          <CustomButton
            title="Retry"
            onPress={handleRetry}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            buttonStyle={styles.retryButton}
          />
        </View>
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
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SH, SW } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    listContent: {
      paddingBottom: SH(20),
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SH(40),
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
      paddingVertical: SH(40),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SH(40),
    },
    fullScreenLoader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenError: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(20),
    },
    retryButton: {
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: SW(24),
    },
  });
};

