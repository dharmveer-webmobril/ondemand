import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import RatingChart from './RatingChart';
import ReviewItem from './ReviewItem';

type Review = {
  id: string;
  userName: string;
  rating: number;
  reviewText: string;
  timeAgo: string;
  isVerified: boolean;
  likes: number;
  dislikes: number;
};

type RatingDistribution = {
  stars: number;
  percentage: number;
  count: number;
};

type ProviderReviewsTabProps = {
  reviews: Review[];
  overallRating?: number;
  ratingDistribution?: RatingDistribution[];
  isFetching?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onReport: () => void;
};

export default function ProviderReviewsTab({
  reviews,
  overallRating = 0,
  ratingDistribution = [],
  isFetching = false,
  refreshing = false,
  onRefresh,
  onReport,
}: ProviderReviewsTabProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <RatingChart
          overallRating={overallRating}
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
          onReport={onReport}
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
