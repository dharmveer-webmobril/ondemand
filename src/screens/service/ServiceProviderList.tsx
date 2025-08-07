import React, { useMemo } from 'react';
import { View, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import {
  Colors, SH, SW, Fonts, SF, boxShadow, goBack,
} from '../../utils';
import imagePaths from '../../assets/images';
import {
  AppHeader, AppText, Buttons, Container, ImageLoader, Spacing,
} from '../../component';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../component/Skeleton';
import { useGetNearByServicesQuery } from '../../redux';
// import RouteName from '../../navigation/RouteName';
import StarRating from 'react-native-star-rating-widget';

const ItemList = ({ item }: any) => {
  const name = item.businessName || 'Unnamed Service';
  const image = item.profilePic ? { uri: item.profilePic } : imagePaths.no_image;
  const location = item?.location;
  const summary = [location?.address, location?.city, location?.state].filter(Boolean).join(', ') || "Unknown";

  return (
    <Pressable
      // onPress={() => navigate(RouteName.SERVICE_DETAILS, { id: item._id })}
      style={styles.serviceContainer}
    >
      <View style={styles.header}>
        <View style={[styles.imageWrapper, boxShadow]}>
          <ImageLoader source={image} resizeMode="cover" mainImageStyle={styles.logo} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <AppText numberOfLines={1} style={styles.text}>{name}</AppText>
            <Image source={imagePaths.verified_star} resizeMode="contain" style={styles.verifiedIcon} />
          </View>
        </View>
      </View>
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
      <Spacing space={10} />
      <View style={styles.locationContainer}>
        <Image source={imagePaths.service_loc} style={styles.icon} />
        <AppText style={styles.locationText}>{summary}</AppText>
        <AppText style={styles.dotText}>•</AppText>
        <AppText style={styles.closedText}>Closed</AppText>
      </View>
    </Pressable>
  );
};

const SkeletonItemList = () => (
  <View style={styles.serviceContainer}>
    <View style={styles.header}>
      <View style={[styles.imageWrapper, boxShadow]}>
        <Skeleton style={styles.logo} />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <Skeleton style={styles.textSkeleton} />
        </View>
        <View style={styles.ratingContainer}>
          <Skeleton style={styles.ratingSkeleton} />
        </View>
      </View>
    </View>
    <Spacing space={10} />
    <View style={styles.locationContainer}>
      <Skeleton style={styles.iconSkeleton} />
      <Skeleton style={styles.locationTextSkeleton} />
      <Skeleton style={styles.dotTextSkeleton} />
      <Skeleton style={styles.closedTextSkeleton} />
    </View>
  </View>
);

const ItemSeparator = () => <View style={styles.separator} />;

const ServiceProviderList = () => {
  const { data: servicesData, isLoading, isError, isFetching, refetch } = useGetNearByServicesQuery();
  const { t } = useTranslation();

  // useEffect(() => {
  //   refetch();
  // }, [refetch]);

  const memoizedData = useMemo(() => servicesData?.data || [], [servicesData]);

  const handleRetry = () => refetch();

  return (
    <Container statusBarColor={Colors.white}>
      <AppHeader
        headerTitle={t('home.services.title')}
        onPress={goBack}
        Iconname="arrowleft"
        headerStyle={styles.headerStyle}
        titleStyle={styles.headerTitleStyle}
      />
      <FlatList
        contentContainerStyle={styles.flatListContainer}
        data={isFetching ? [1, 2, 3, 4, 5, 6] : memoizedData}
        keyExtractor={(item, index) => (isFetching ? `skeleton-${index}` : item?._id ?? `item-${index}`)}
        renderItem={({ item }) => (isFetching ? <SkeletonItemList /> : <ItemList item={item} />)}
        ItemSeparatorComponent={ItemSeparator}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          memoizedData.length === 0 && !isFetching && !isError ? (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>
                {t('home.services.notFound')}
              </AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          !isLoading && isError && memoizedData.length === 0 ? (
            <View style={styles.errorContainer}>
              <AppText style={styles.errorText}>
                {t('home.services.errorMessage')}
              </AppText>
              <Buttons
                buttonStyle={styles.retryButton}
                buttonTextStyle={styles.retrybuttontext}
                title={t('home.services.retry')}
                onPress={handleRetry}
              />
            </View>
          ) : null
        }
      />
    </Container>
  );
};

export default ServiceProviderList;

const styles = StyleSheet.create({
  flatListContainer: {
    paddingBottom: SH(10),
  },
  separator: {
    height: SH(15),
    backgroundColor: Colors.white,
  },
  serviceContainer: {
    marginHorizontal: SW(20),
    backgroundColor: '#EEF6F9',
    borderRadius: 10,
    padding: SW(15),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width: SW(52),
    height: SW(52),
    borderRadius: SW(26),
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SW(10),
  },
  text: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(15),
    maxWidth: '80%',
  },
  verifiedIcon: {
    width: SW(16),
    height: SW(16),
    marginLeft: SW(6),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SH(5),
    marginLeft: SW(8),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: SF(15),
    height: SF(15),
    resizeMode: 'contain',
    tintColor: Colors.textAppColor,
  },
  locationText: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    marginLeft: SW(5),
  },
  dotText: {
    fontSize: SF(20),
    marginHorizontal: SW(3),
    color: Colors.gray2,
  },
  closedText: {
    color: Colors.gray2,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  headerStyle: {
    backgroundColor: Colors.bgwhite,
    marginVertical: SH(10),
    marginHorizontal: 10,
    marginBottom: 20,
  },
  headerTitleStyle: {
    color: Colors.textHeader,
    fontSize: SF(18),
  },
  // Skeleton styles
  textSkeleton: {
    height: SF(15),
    width: SW(200),
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  ratingSkeleton: {
    height: SF(16),
    width: SW(100),
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  iconSkeleton: {
    height: SF(15),
    width: SF(15),
    borderRadius: SF(7.5),
    backgroundColor: '#E0E0E0',
  },
  locationTextSkeleton: {
    height: SF(12),
    width: SW(100),
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginLeft: SW(5),
  },
  dotTextSkeleton: {
    height: SF(20),
    width: SF(20),
    borderRadius: SF(10),
    backgroundColor: '#E0E0E0',
    marginHorizontal: SW(3),
  },
  closedTextSkeleton: {
    height: SF(12),
    width: SW(50),
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SF(70),
  },
  emptyText: {
    color: Colors.textAppColor,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
  },
  errorContainer: {
    padding: SW(10),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorText: {
    color: Colors.red,
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    textAlign: 'center',
    width: '100%',
  },
  retryButton: {
    padding: SW(10),
    backgroundColor: Colors.themeColor,
    borderRadius: SF(8),
    marginTop: SH(10),
    width: '50%',
    height: SH(40),
    marginHorizontal:5
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
    textAlign: 'center',
  },
  starStyle: {
    marginHorizontal: 2,
  },
  ratingtxt: {
    color: Colors.textAppColor,
    fontFamily: Fonts.REGULAR,
    marginLeft: 5,
    fontSize: SF(12),
  },
});