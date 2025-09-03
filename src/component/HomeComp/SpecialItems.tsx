import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { boxShadow, Colors, Fonts, SF, SH, SW } from '../../utils';
import AppText from '../AppText';
import ImageLoader from '../ImageLoader';
import { Source } from 'react-native-fast-image';
import Shimmer from '../Shimmer';

interface SpecialItemsProps {
  name: string;
  image: Source;
  id: string | number;
  onClick?: () => void;
}

const SpecialItems: React.FC<SpecialItemsProps> = ({ image, name, onClick }) => {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[styles.imageContainer, boxShadow]}>
        <ImageLoader
          source={image}
          resizeMode="cover"
          mainImageStyle={styles.imageLoader}
        />
      </View>
      <AppText style={styles.text}>{name}</AppText>
    </TouchableOpacity>
  );
};

const SpecialItemsSkeleton: React.FC = () => {
  return (
    <View>
      <View style={[styles.imageContainer, boxShadow]}>
        <Shimmer style={styles.imageLoader} />
      </View>
      <Shimmer style={styles.textSkeleton} />
    </View>
  );
};

export default React.memo(SpecialItems);
export { SpecialItemsSkeleton };

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 10,
    backgroundColor: "#ffffff"
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
  textSkeleton: {
    height: SF(12),
    width: SF(80),
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: '#E0E0E0', // Placeholder color for skeleton
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