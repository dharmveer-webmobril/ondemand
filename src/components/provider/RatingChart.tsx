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
      <View style={styles.row}>
        <View style={styles.ratingDisplay}>
          <CustomText style={styles.ratingNumber}>
            {overallRating.toFixed(1)}
          </CustomText>
          <View style={{marginHorizontal: theme.SW(4)}}>

          <StarRating
            rating={overallRating}
            onChange={() => {}}
            starSize={theme.SF(18)}
            starStyle={{marginHorizontal: theme.SW(2)}}
            color="#FAAC00"
            enableSwiping={false}
          />
          </View>
        </View>

        <View style={styles.chartContainer}>
          {ratingDistribution.map(item => (
            <View key={item.stars} style={styles.barRow}>
              <CustomText style={styles.starLabel}>{item.stars}★</CustomText>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${item.percentage}%` },
                  ]}
                />
              </View>
              <CustomText style={styles.percentageText}>
                {`${item.percentage}% (${item.count})`}
              </CustomText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      paddingHorizontal: SW(16),
      paddingVertical: SH(16),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(16),
    },
    ratingDisplay: {
      alignItems: 'center',
      width: SW(96),
    },
    ratingNumber: {
      fontSize: SF(34),
      fontFamily: Fonts.BOLD,
      color: Colors.text,
      marginBottom: SH(4),
    },
    chartContainer: {
      flex: 1,
      gap: SH(6),
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    starLabel: {
      fontSize: SF(11),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      width: SW(22),
    },
    barContainer: {
      flex: 1,
      height: SF(6),
      backgroundColor: Colors.border || '#E5E7EB',
      borderRadius: SF(3),
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      backgroundColor: Colors.primary,
      borderRadius: SF(3),
    },
    percentageText: {
      fontSize: SF(10),
      fontFamily: Fonts.MEDIUM,
      color: Colors.lightText || Colors.text,
      minWidth: SW(70),
      textAlign: 'right',
    },
  });
};

