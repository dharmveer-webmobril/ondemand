import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { AppText, VectoreIcons } from '../../../component';
import { Colors, SF, SH } from '../../../utils';

// Interface for props
interface RatingItemProps {
  rating: number;
  selectedRatings: number[];
  onSelectRating: (rating: number) => void;
}

const RatingItem: FC<RatingItemProps> = ({ rating, selectedRatings, onSelectRating }) => {
  return (
    <TouchableOpacity
      style={[
        styles.ratingButton,
        selectedRatings.includes(rating) && styles.selectedRatingButton,
      ]}
      onPress={() => onSelectRating(rating)}
    >
      <AppText
        style={[
          styles.ratingText,
          selectedRatings.includes(rating) && styles.selectedRatingText,
        ]}
      >
        <VectoreIcons
          icon="AntDesign"
          name={selectedRatings.includes(rating) ? 'star' : 'staro'}
          size={SF(12)}
          color={selectedRatings.includes(rating) ? Colors.white : Colors.themeColor}
        />{' '}
        {rating}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ratingButton: {
    paddingVertical: SF(5),
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SF(10),
    borderColor: Colors.themeColor,
    borderWidth: 1,
    marginBottom: SH(5),
  },
  selectedRatingButton: {
    backgroundColor: Colors.themeColor,
  },
  ratingText: {
    color: Colors.themeColor,
    fontFamily: 'MEDIUM',
    fontSize: SF(12),
  },
  selectedRatingText: {
    color: Colors.white,
  },
});

export default RatingItem;