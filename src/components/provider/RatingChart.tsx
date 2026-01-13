import { View, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import StarRating from 'react-native-star-rating-widget';

type RatingChartProps = {
  overallRating: number;
  ratingDistribution: {
    stars: number;
    percentage: number;
    count: number;
  }[];
};

export default function RatingChart({
  overallRating,
  ratingDistribution,
}: RatingChartProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingDisplay}>
          <CustomText style={styles.ratingNumber}>
            {overallRating.toFixed(1)}
          </CustomText>
          <StarRating
            rating={overallRating}
            onChange={() => {}}
            starSize={theme.SF(20)}
            color="#FAAC00"
            readOnly
          />
        </View>
      </View>

      <View style={styles.chartContainer}>
        {ratingDistribution.map((item) => (
          <View key={item.stars} style={styles.barRow}>
            <CustomText style={styles.starLabel}>{item.stars} star</CustomText>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  { width: `${item.percentage}%` },
                ]}
              />
            </View>
            <CustomText style={styles.percentageText}>
              {item.percentage}%
            </CustomText>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      paddingHorizontal: SW(20),
      paddingVertical: SH(20),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    ratingHeader: {
      alignItems: 'center',
      marginBottom: SH(20),
    },
    ratingDisplay: {
      alignItems: 'center',
    },
    ratingNumber: {
      fontSize: SF(48),
      fontFamily: Fonts.BOLD,
      color: Colors.text,
      marginBottom: SH(8),
    },
    chartContainer: {
      gap: SH(12),
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(12),
    },
    starLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      width: SW(50),
    },
    barContainer: {
      flex: 1,
      height: SF(8),
      backgroundColor: Colors.gray || '#E0E0E0',
      borderRadius: SF(4),
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      backgroundColor: Colors.primary,
      borderRadius: SF(4),
    },
    percentageText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      width: SW(40),
      textAlign: 'right',
    },
  });
};

