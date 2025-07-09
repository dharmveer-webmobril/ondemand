import { View, Text, Image, ImageProps, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import imagePaths from '../../assets/images';
import Spacing from '../Spacing';
import StarRating from 'react-native-star-rating-widget';
import RouteName from '../../navigation/RouteName';
import { useNavigation } from '@react-navigation/native';
import AppText from '../AppText';

interface HomeCategoryItemProps {
  name: string;
  image: ImageProps;
  id: string | number;
}

const HomeCategoryItem: React.FC<HomeCategoryItemProps> = () => {
  const navigation = useNavigation<any>();
  return (
    <Pressable onPress={() => { navigation.navigate(RouteName.SERVICE_DETAILS) }} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={imagePaths.electrical}
          resizeMode="cover"
          style={styles.logo}
        />
        <AppText style={styles.text}>{'Palmcedar Cleaning'}</AppText>
        <Image
          source={imagePaths.verified_star}
          resizeMode="contain"
          style={styles.verifiedIcon}
        />
      </View>
      <Spacing space={10} />
      <View style={styles.ratingContainer}>
        <StarRating starStyle={{ marginHorizontal: 0}} starSize={SF(12)}  onChange={() => { }} color='#FAAC00'  rating={3.5} />
        <AppText style={styles.ratingtxt}>{'4.6'}</AppText>
      </View>
      <Spacing space={7} />
      <View style={styles.locationContainer}>
        <Image source={imagePaths.service_loc} style={styles.locationIcon} />
        <AppText style={styles.addtext}>Ikeja, Nigeria</AppText>
        <AppText style={styles.dotText}> . </AppText>
        <AppText style={styles.closetext}>Closed</AppText>
      </View>
      <Spacing space={7} />
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Image source={imagePaths.money} style={styles.moneyIcon} />
          <AppText style={styles.addtext}>Starts @ $ 30/hr</AppText>
        </View>
        <View style={styles.durationContainer}>
          <AppText style={styles.dotText}> . </AppText>
          <Image source={imagePaths.ClockClockwise} style={styles.clockIcon} />
          <AppText style={styles.closetext}>1</AppText>
        </View>
      </View>
    </Pressable>
  );
};
export default HomeCategoryItem;

const styles = StyleSheet.create({
  container: {
    width: SW(200),
    marginRight: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    width: '100%',
  },
  logo: {
    width: SF(28),
    height: SF(28),
    borderRadius: SF(28) / 2,
  },
  verifiedIcon: {
    width: SF(14),
    height: SF(14),
    marginLeft:SF(8)
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginLeft:SF(10)
  },
  ratingContainer: {
    width: SF(90),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    backgroundColor: 'transparent',
  },
  ratingtxt: {
    color: Colors.textAppColor,
    fontFamily: Fonts.REGULAR,
    marginLeft: 5,
    fontSize: SF(12),
  },
  locationContainer: {
    width: SW(90),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    height: SF(15),
    width: SF(15),
    resizeMode: 'contain',
    tintColor: Colors.textAppColor,
  },
  addtext: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    marginLeft: 5,
    fontSize: SF(12),
  },
  closetext: {
    color: Colors.gray2,
    fontFamily: Fonts.MEDIUM,
    marginLeft: 5,
    fontSize: SF(12),
  },
  dotText: {
    fontFamily: Fonts.EXTRA_BOLD,
    fontSize:SF(18),
    marginTop: SF(-8),
    marginLeft: 2,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moneyIcon: {
    height: SF(15),
    width: SF(15),
    resizeMode: 'contain',
    tintColor: Colors.textAppColor,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft:SF(9)
  },
  clockIcon: {
    height: SF(12),
    width: SF(12),
    resizeMode: 'contain',
    tintColor: Colors.gray2,
  },
});
