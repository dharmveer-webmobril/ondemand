import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors, SH, SW, Fonts, SF, handleSuccessToast, handleApiError, handleApiFailureResponse } from '../../utils';
import {
  AppHeader,
  AppText,
  Buttons,
  Container,
  Divider,
  ImageLoader,
  SubmitRatingReviewModal,
  VectoreIcons,
  BookingServiceItem,
  TabTop,
  showAppToast,
  RatingReviewComponent,
} from '../../component';
import { useNavigation, useRoute } from '@react-navigation/native';
import imagePaths from '../../assets/images';
import {
  useAddRatingReviewForProviderMutation,
  useAddRatingReviewForServiceMutation,
  useGetRatingForProviderQuery,
  useGetRatingForServiceQuery,
} from '../../redux';
import MapView, { Marker } from 'react-native-maps';


const BookingDetails: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTabs] = useState(1);
  const [isForProvider, setIsForProvider] = useState(true); // Track whether the review is for provider or service

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingDetail } = route?.params;

  const { provider = {}, service = {}, bookingId } = bookingDetail;
  console.log('bookingId', bookingId, 'provider', provider, 'service', service);

  const [submitServiceReview, { isLoading: isServiceReviewLoading }] = useAddRatingReviewForServiceMutation(); // form data
  const [submitProviderReview, { isLoading: isProviderReviewLoading }] = useAddRatingReviewForProviderMutation(); // json

  const {
    data: ratingForProvider,
    isFetching: isProviderFetching,
    refetch: refetchRatingForProvider,
  } = useGetRatingForProviderQuery({ bookingId });
  const ratingForProviderData = useMemo(() => ratingForProvider?.data || null, [ratingForProvider]);

  const {
    data: ratingForService,
    isFetching: isServiceFetching,
    refetch: refetchRatingForService
  } = useGetRatingForServiceQuery({ bookingId });
  const ratingForServiceData = useMemo(() => ratingForService?.data || null, [ratingForService]);

  console.log('ratingForProviderData', ratingForProviderData, 'ratingForServiceData', ratingForServiceData);

  const handleSubmitProviderReview = async (rating: number, review: string) => {
    if (!provider?._id) {
      showAppToast({
        title: 'Error',
        message: 'Provider not found',
        type: 'error',
      });
      return;
    }
    try {
      let data = {
        providerId: provider?._id,
        bookingId,
        rating,
        comment: review,
      };
      let response = await submitProviderReview({ data }).unwrap();
      if (response.success) {
        refetchRatingForProvider();
        handleSuccessToast(response.message || '');
      } else {
        handleApiFailureResponse(response, '');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setModalVisible(false);
    }
  };

  const handleSubmitServiceReview = async (rating: number, review: string) => {
    if (!service?._id) {
      showAppToast({
        title: 'Error',
        message: 'Service not found',
        type: 'error',
      });
      return;
    }
    try {
      let data = new FormData();
      data.append('serviceId', service?._id);
      data.append('bookingId', bookingId);
      data.append('rating', rating.toString());
      data.append('comment', review);
      let response = await submitServiceReview({ formData: data, bookingId }).unwrap();
      if (response.success) {
        refetchRatingForService();
        handleSuccessToast(response.message || '');
      } else {
        handleApiFailureResponse(response, '');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setModalVisible(false);
    }
  };

  const handleSubmitReview = (rating: number, review: string) => {
    if (isForProvider) {
      handleSubmitProviderReview(rating, review);
    } else {
      handleSubmitServiceReview(rating, review);
    }
  };

  const showModalFor = (forProvider: boolean) => {
    setIsForProvider(forProvider);
    setModalVisible(true);
  };

  return (
    <Container statusBarColor={Colors.white}>
      <SubmitRatingReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitReview}
        btnLoading={isServiceReviewLoading || isProviderReviewLoading}
      />
      <AppHeader
        headerTitle="WM Barbershop"
        onPress={() => {
          navigation.goBack();
        }}
        Iconname="arrowleft"
        headerStyle={styles.headerStyle}
        titleStyle={styles.headerTitleStyle}
      />

      <ScrollView>
        <View style={styles.mapImage}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 22.7377,
              longitude: 75.8788,
              latitudeDelta: 0.0922, // Smaller delta for more zoom
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            zoomControlEnabled={true}
          // minZoomLevel={11}   // 👈 minimum zoom out (5 ~ country level)
          // maxZoomLevel={18}  // 👈 maximum zoom in (18 ~ street/building level)
          >
            <Marker
              coordinate={{ latitude: 22.7377, longitude: 75.8788 }}
              title="My Marker"
              description="This is a marker in Delhi"
            />
          </MapView>
        </View>


        <View style={styles.shopInfoContainer}>
          <View style={styles.shopTextBlock}>
            <AppText style={styles.shopTitle}>
              WM Barbershop{' '}
              <AppText style={styles.shopCount}>with Juana</AppText>
            </AppText>
            <AppText style={styles.shopAddress}>
              1893 Cheshire Bridge Rd Ne, 30325
            </AppText>
          </View>
          <View style={styles.iconsBlock}>
            <VectoreIcons
              icon="Feather"
              name="share-2"
              size={SF(20)}
              color={Colors.black}
            />
          </View>
        </View>

        <View style={styles.serviceContainer}>
          <BookingServiceItem
            subtitles="With Juana"
            time="8:00 am - 8:30 am"
            title="Only Haircut"
            price="$8989"
          />
          <BookingServiceItem title="Subtotal" price="$8989" />
        </View>

        <View style={styles.ratingsContainer}>
          <AppText style={styles.addTipButton}>Ratings</AppText>
          <TabTop
            activeTab={activeTab}
            changeTab={(val: any) => setActiveTabs(val)}
            tabArr={['Provider', 'Service']}
          />

          <View style={styles.reviewBox}>
            <AppText style={styles.reviewHeading}>Your review</AppText>
            <Divider height={1} color="#0000000D" marginTop={10} />

            <RatingReviewComponent
              activeTab={activeTab}
              ratingData={activeTab === 1 ? ratingForProviderData : ratingForServiceData}
              isLoading={activeTab === 1 ? isProviderFetching : isServiceFetching}
              onAddRating={() => showModalFor(activeTab === 1)}
              bookingId={bookingId}
              provider={provider}
              service={service}
            />
          </View>
        </View>
      </ScrollView>

      <Buttons
        onPress={() => { }}
        title="Book Again"
        buttonStyle={styles.bookAgainButton}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: Colors.bgwhite,
    marginVertical: SH(10),
    marginBottom: SF(20),
    paddingHorizontal: SW(30),
  },
  headerTitleStyle: {
    color: Colors.textHeader,
    fontSize: SF(18),
  },
  mapImage: {
    height: SH(200),
    width: '100%',
  },
  shopInfoContainer: {
    backgroundColor: '#0000000D',
    paddingVertical: SH(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '7%',
  },
  shopTextBlock: {
    width: '66%',
  },
  shopTitle: {
    fontSize: SF(14),
    fontFamily: Fonts.SEMI_BOLD,
    color: Colors.txtAppDarkColor,
  },
  shopCount: {
    fontSize: SF(10),
    fontFamily: Fonts.MEDIUM,
    color: Colors.lightGraytext,
  },
  shopAddress: {
    fontSize: SF(10),
    fontFamily: Fonts.MEDIUM,
    color: Colors.lightGraytext,
    marginTop: SH(3),
  },
  iconsBlock: {
    width: '25%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  serviceContainer: {
    paddingHorizontal: SW(25),
    marginTop: SH(15),
    flex: 1,
  },
  ratingsContainer: {
    marginTop: SH(15),
    paddingHorizontal: SW(25),
  },
  addTipButton: {
    textAlign: 'left',
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(16),
    marginBottom: SH(20),
    color: Colors.themeColor,
  },
  reviewBox: {
    marginTop: SH(15),
    marginBottom: SH(25),
    borderRadius: SW(10),
    borderWidth: 1,
    borderColor: Colors.borderColor,
    padding: SW(15),
    backgroundColor: '#0000000D',
  },
  reviewHeading: {
    fontSize: SF(12),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
  },

  bookAgainButton: {
    width: '86%',
    alignSelf: 'center',
    marginBottom: SH(20),
  },
  loaderContainer: {
    height: SH(90),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRatingBox: {
    height: SH(90),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRatingText: {
    fontSize: SF(10),
    fontFamily: Fonts.REGULAR,
    color: Colors.textAppColor,
    marginBottom: 10,
  },
  addRatingButton: {
    width: '50%',
    height: SH(35),
  },
  addRatingButtonText: {
    fontSize: SF(10),
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SH(10),
  },
  ratingContainer: {
    width: SW(90),
    flexDirection: 'row',
    alignItems: 'center',
  },
  starStyle: {
    marginHorizontal: 0,
  },
  ratingtxt: {
    color: '#6C757D',
    fontFamily: Fonts.MEDIUM,
    marginLeft: 5,
    fontSize: SF(14),
  },
  reviewDate: {
    fontFamily: Fonts.MEDIUM,
    color: '#6C757D',
    textAlign: 'right',
    fontSize: SF(14),
  },
  reviewText: {
    fontFamily: Fonts.REGULAR,
    color: Colors.textAppColor,
    textAlign: 'left',
    marginTop: SH(10),
    fontSize: SF(10),
    lineHeight: SF(16),
  },
});

export default BookingDetails;