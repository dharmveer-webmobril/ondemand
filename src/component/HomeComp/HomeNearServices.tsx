import React, { useCallback, useMemo } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, navigate, SF, SH, SW } from '../../utils';
import imagePaths from '../../assets/images';
import AppText from '../AppText';
import Spacing from '../Spacing';
import HomeSubContainerHeader from './HomeSubContainerHeader';
import RouteName from '../../navigation/RouteName';
import StarRating from 'react-native-star-rating-widget';
import ImageLoader from '../ImageLoader';
import Shimmer from '../Shimmer';

const skeletonPlaceholder = [1, 2, 3, 4, 5, 6];

const ListItem = ({ item }: { item: any }) => {
  const name = item.businessName || 'Unnamed Service';
  const image = item.profilePic ? { uri: item.profilePic } : imagePaths.no_image;
  const location = item?.location;
  const summary = [location?.address, location?.city, location?.state].filter(Boolean).join(', ') || "Unknown";
  return (
    <Pressable
      onPress={() => { navigate(RouteName.SHOP_DETAILS, { bookingType: 'bookingType', providerDetails: item }); }}
      style={styles.container}
    >
      <View style={styles.header}>
        <ImageLoader source={image} mainImageStyle={styles.logo} resizeMode="cover" />
        <AppText style={styles.text}>{name}</AppText>
        <Image source={imagePaths.verified_star} style={styles.verifiedIcon} resizeMode="contain" />
      </View>

      <Spacing space={10} />

      <View style={styles.ratingContainer}>
        <StarRating
          starStyle={styles.starStyle}
          starSize={SF(12)}
          rating={item.rating || 0}
          onChange={() => { }}
          color="#FAAC00"
        />
        <AppText style={styles.ratingtxt}>({item.rating || 0})</AppText>
      </View>

      <Spacing space={7} />

      <View style={styles.locationContainer}>
        <Image source={imagePaths.service_loc} style={styles.locationIcon} />
        <AppText style={styles.addtext} numberOfLines={1}>
          {summary}
        </AppText>
        <AppText style={styles.dotText}> . </AppText>
        <AppText style={styles.closetext}>Closed</AppText>
      </View>
    </Pressable>
  );
};

const ListItemSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Shimmer style={styles.logo} />
      <Shimmer style={styles.textSkeleton} />
    </View>

    <Spacing space={10} />

    <View style={styles.ratingContainer}>
      <Shimmer style={styles.ratingSkeleton} />
    </View>

    <Spacing space={7} />

    <View style={{ width: SW(140) }}>
      <Shimmer style={styles.locationIconskelton} />
    </View>
  </View>
);

const HomeNearServices = ({ servicesArr, isLoading, isError }: { servicesArr: any, isLoading: boolean, isError: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <HomeSubContainerHeader
        rightText={t('home.serviceViewAll')}
        leftText={t('home.nearbyServices')}
        marginHori="7%"
        onClick={() => {
          !isLoading && !isError && navigate(RouteName.SERVICE_PROVIDER_LIST)
        }}
      />
      <View style={styles.backgroundContainer}>
        <FlatList
          horizontal
          contentContainerStyle={[
            styles.flatListContainer,
            (isLoading || isError) && styles.fullWidth,
          ]}
          data={isLoading ? [12, 23, 34, 45, 23] : servicesArr}
          renderItem={({ item }) => {
            return isLoading ? <ListItemSkeleton /> : <ListItem item={item} />
          }
          }
          keyExtractor={(item, index) =>
            `servicenear-${item?._id ?? index}`
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.messageContainer}>
                <AppText style={styles.messageText}>
                  {!isError ? '' : t('home.services.notFound')}
                </AppText>
              </View>
            ) : null
          }
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </>
  );
};

export default HomeNearServices;

const styles = StyleSheet.create({
  container: {
    width: SW(190),
    marginRight: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: SF(28),
    height: SF(28),
    borderRadius: SF(14),
  },
  verifiedIcon: {
    width: SF(14),
    height: SF(14),
    marginLeft: SF(8),
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginLeft: SF(10),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SF(90),
  },
  ratingtxt: {
    color: Colors.textAppColor,
    fontFamily: Fonts.REGULAR,
    marginLeft: 5,
    fontSize: SF(12),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SW(120),
  },
  locationIconskelton: {
    height: SF(15),
    width: SF(160),
    resizeMode: 'contain',
    tintColor: Colors.textAppColor,
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
    fontSize: SF(18),
    marginTop: -4,
    marginLeft: 2,
  },
  flatListContainer: {
    paddingHorizontal: '5%',
    backgroundColor: '#EEF6F9',
    paddingVertical: SH(20),
  },
  skeletonContainer: {
    width: SW(200),
    marginRight: 30,
    alignItems: 'center',
  },
  skeletonImage: {
    height: SF(56),
    width: SF(56),
    borderRadius: SF(28),
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: SF(14),
    width: SW(80),
    marginTop: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: SH(20),
  },
  messageText: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
  },
  retryButton: {
    padding: SW(10),
    backgroundColor: Colors.themeColor,
    borderRadius: SF(8),
    marginTop: SH(10),
    width: '50%',
    height: SH(40),
    paddingHorizontal: 5
  },
  retrybuttontext: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textWhite,
    textAlign: 'center'
  },
  viewalltext: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textWhite,
  },
  starStyle: {
    marginHorizontal: 2,
  },
  fullWidth: {
    width: '100%',
  },
  // New skeleton styles
  textSkeleton: {
    height: SF(12),
    width: SW(120),
    marginLeft: SF(10),
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  ratingSkeleton: {
    height: SF(12),
    width: SF(80),
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  ratingtxtSkeleton: {
    height: SF(12),
    width: SF(30),
    marginLeft: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  locationIconSkeleton: {
    height: SF(15),
    width: SF(15),
    backgroundColor: '#E0E0E0',
    borderRadius: SF(15) / 2,
  },
  addtextSkeleton: {
    height: SF(12),
    width: SW(80),
    marginLeft: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  dotTextSkeleton: {
    height: SF(18),
    width: SF(18),
    marginLeft: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: SF(18) / 2,
  },
  closetextSkeleton: {
    height: SF(12),
    width: SF(40),
    marginLeft: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  backgroundContainer: {
    backgroundColor: '#EEF6F9',
    marginTop: SF(17),
    marginBottom: SF(30),
  },
});