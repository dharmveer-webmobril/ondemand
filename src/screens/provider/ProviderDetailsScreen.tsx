import { StyleSheet, FlatList } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useRoute, } from '@react-navigation/native';
import { Container,  } from '@components/common';
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

type TabType = 'services' | 'reviews' | 'portfolio' | 'details';

// Mock data - Replace with actual API calls
const mockServices = [
  { id: '1', name: 'Haircut + Beard', price: 55.00, duration: '30m', icon: 'cut' },
  { id: '2', name: 'Only Haircut', price: 55.00, duration: '30m', icon: 'cut' },
  { id: '3', name: 'Razor', price: 55.00, duration: '25m', icon: 'cut' },
  { id: '4', name: 'Kids Haircut', price: 30.00, duration: '15m', icon: 'cut' },
  { id: '5', name: 'Enchantments', price: 15.00, duration: '10m', icon: 'sparkles' },
];

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

const mockPortfolioImages = [
  'https://via.placeholder.com/300',
  'https://via.placeholder.com/300',
  'https://via.placeholder.com/300',
  'https://via.placeholder.com/300',
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
  const route = useRoute();
  const [activeTab, setActiveTab] = useState<TabType>('services');

  const provider = (route.params as any)?.provider || {
    id: '1',
    name: 'WM Barbershop',
    logo: 'https://via.placeholder.com/100',
    address: '1893 Cheshire Bridge Rd Ne, 30325',
    serviceType: 'Home Service',
    rating: 4.8,
    reviewCount: 200,
  };

  const handleBookService = (serviceId: string) => {
    navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
      providerId: provider.id,
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
    navigate(SCREEN_NAMES.REPORT, { providerId: provider.id });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return (
          <FlatList
            data={mockServices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ServiceItem
                id={item.id}
                name={item.name}
                price={item.price}
                duration={item.duration}
                icon={item.icon}
                onBook={() => handleBookService(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        );
      case 'reviews':
        return (
          <FlatList
            data={mockReviews}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <RatingChart
                overallRating={typeof provider.rating === 'number' ? provider.rating : 4.8}
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
          />
        );
      case 'portfolio':
        return (
          <PortfolioGrid
            images={mockPortfolioImages}
            onImagePress={(index) => console.log('Image pressed:', index)}
          />
        );
      case 'details':
        return (
          <ProviderDetails
            aboutUs="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            phoneNumber="(3945687456)"
            onCall={() => console.log('Call pressed')}
            facebookUrl="https://facebook.com"
            instagramUrl="https://instagram.com"
            websiteUrl="https://website.com"
            amenities={['Places parking', 'WIFI', 'Accessible Personal Handicaps']}
            onServiceFeePress={handleServiceFeePress}
            onPaymentPolicyPress={handlePaymentPolicyPress}
            onReportPress={handleReportPress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <ProviderHeader
        name={provider.name}
        logo={provider.logo}
      />
      <ProviderSubHeader
        logo={provider.logo}
        name={provider.name}
        address={provider.address}
        serviceType={provider.serviceType}
        rating={typeof provider.rating === 'number' ? provider.rating : undefined}
        reviewCount={provider.reviewCount}
        onShare={() => console.log('Share pressed')}
        onFavorite={(isFavorite: any) => console.log('Favorite:', isFavorite)}
      />
      <ProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    listContent: {
      paddingBottom: SH(20),
    },
  });
};

