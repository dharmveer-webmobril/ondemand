import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { boxShadow, boxShadowlight, Colors, Fonts, SF, SH, SW } from '../../utils';
import AppText from '../AppText';
import ImageLoader from '../ImageLoader';
import { Source } from 'react-native-fast-image';

interface HomeRecommendedItemsProps {
  name: string;
  image: Source;
  id: string | number;
}

const HomeRecommendedItems: React.FC<HomeRecommendedItemsProps> = ({ image, name }) => {
  return (
    <View>
      <View style={[styles.imageContainer, boxShadow]}>
        <ImageLoader
          source={image}
          resizeMode="cover"
          mainImageStyle={styles.imageLoader}
        />
      </View>
      <AppText style={styles.text}>{name}</AppText>

      {/* Uncomment if rating is needed */}
      {/* <View style={styles.ratingContainer}>
        <Image source={imagePaths.star_filled} resizeMode="contain" style={styles.verifiedIcon} />
        <AppText style={styles.ratingtext}>{'4.5'}</AppText>
      </View> */}
    </View>
  );
};

export default React.memo(HomeRecommendedItems);

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 10,
  },
  imageLoader: {
    height: SF(100),
    width: SF(135),
    borderRadius: SF(10),
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedIcon: {
    width: SW(14),
    height: SW(14),
  },
  ratingtext: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SH(12),
    marginLeft: 5,
  },
});
