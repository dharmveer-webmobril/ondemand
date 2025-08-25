import React, { useState, useEffect, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  AppHeader,
  AppText,
  Buttons,
  Container,
  SweetaelertModal,
  VectoreIcons,
} from '../../component'; // Adjust based on your actual paths
import { Colors, Fonts, handleApiError, handleApiFailureResponse, handleSuccessToast, navigate, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';
import AddressMenu from './AddressMenu';
import { RootState, setBookingJson, useDeleteAddressMutation, useGetAddressQuery } from '../../redux';
import { Skeleton } from '../../component/Skeleton';
import VectorIcon from '../../component/VectoreIcons';
import { useDispatch, useSelector } from 'react-redux';

const MyAddressScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const { t } = useTranslation();


  const { data: addressData = [], isError, refetch, isFetching } = useGetAddressQuery();

  const memoizedData = useMemo(() => addressData?.data || [], [addressData]);
  console.log('addressDataaddressData', addressData);
  // useState
  const handleRetry = () => refetch();

  const showSkeleton = isFetching && !isError;
  const showError = !isFetching && isError;
  const showEmpty = !isFetching && !isError && memoizedData.length === 0;
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch]);




  const renderSkeleton = () => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardContent}>
          <Skeleton style={styles.skeletonLine1} />
          <Skeleton style={styles.skeletonLine} />
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    console.log('item', item);

    return <TouchableOpacity style={styles.card} onPress={() => setSelectedAddress(item?._id)}>
      <View style={styles.cardTop}>
        <View style={styles.cardContent}>
          <AppText style={styles.cardTitle}>{item?.type || ''}</AppText>
          <AppText style={styles.cardSubtitle}>
            {`${item?.apartment || ''}, ${item?.streetAddress || ''}, ${item?.city || ''}, ${item?.state || ''}, ${item?.zip || ''}`}
          </AppText>
        </View>
        <View style={styles.dotMenu}>
          {selectedAddress !== item?._id ? <VectoreIcons
            name="radio-button-unchecked"
            icon='MaterialIcons'
            size={SF(20)}
            color={Colors.textAppColor}
          />
            :
            <VectoreIcons
              name="radio-button-checked"
              icon='MaterialIcons'
              size={SF(20)}
              color={Colors.textAppColor}
            />
          }
        </View>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  };


  const bookingJson = useSelector((state: RootState) => state.service.bookingJson);
  const dispatch = useDispatch();

  const btnConfirmButton = () => {
    if (selectedAddress) {
      const addjson = memoizedData.find((item: any) => item._id === selectedAddress);
      let bookingData = { ...bookingJson, myAddId: selectedAddress, myAdd: addjson };
      dispatch(setBookingJson(bookingData));
      navigation.navigate(RouteName.PAYMENT_SCREEN);
      // navigation.navigate(RouteName.SELECT_ADDRESS, { selectedAddress });
    } else {
      handleApiFailureResponse('', 'Please select an address');
    }
  }


  return (
    <Container>

      <AppHeader
        headerTitle={t('myAddress.title', { defaultValue: 'My Address' })}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />
      <View style={{ width: '40%', marginLeft: 'auto', marginRight: '6%', marginBottom: 20 }}>
        <Buttons
          title={'Add New Address'}
          onPress={() => navigate(RouteName.ADD_ADDRESS, { prevScreen: 'my-address' })}
          buttonStyle={styles.addButton1}
          buttonTextStyle={styles.addButtonText}
          textColor={Colors.textWhite}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={showSkeleton ? [1, 3, 4, 5, 6] : memoizedData}
        renderItem={({ item }) =>
          showSkeleton ? renderSkeleton() : renderItem({ item })
        }
        keyExtractor={(item, index) =>
          `servicenear-${item?._id ?? index}`
        }
        ListEmptyComponent={
          showEmpty ? (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>{t('myAddress.notFound', { defaultValue: 'No addresses found' })}</AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          showError ? (
            <View style={styles.errorContainer}>
              <AppText style={styles.errorText}>{t('myAddress.error', { defaultValue: 'Error loading addresses' })}</AppText>
              <Buttons
                title={t('myAddress.retry', { defaultValue: 'Retry' })}
                onPress={handleRetry}
                buttonStyle={styles.retryButton}
                textColor={Colors.textWhite}
              />
            </View>
          ) : null
        }
        showsHorizontalScrollIndicator={false}
      />


      {!showSkeleton && <View style={styles.buttonContainer}>
        <Buttons
          title={'Confirm'}
          onPress={() => {
            btnConfirmButton()
          }}
          buttonStyle={styles.addButton}
          textColor={Colors.textWhite}
        />
      </View>}

    </Container>
  );
};

export default MyAddressScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
    marginVertical: SW(15),
  },
  listContent: {
    paddingHorizontal: SW(25),
    paddingBottom: SH(100),
  },
  card: {
    marginBottom: SH(15),
    width: '100%',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    marginBottom: SH(4),
  },
  cardSubtitle: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textHeader,
  },
  dotMenu: {
    paddingLeft: SW(10),
    paddingTop: SH(5),
    zIndex: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#3D3D3D30',
    marginTop: SH(10),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: SH(20),
    left: SW(25),
    right: SW(25),
  },
  addButtonText: {
    fontSize: SF(12),
    fontFamily: Fonts.MEDIUM,
  },
  addButton: {
    height: SH(48),
    borderRadius: SW(8),
    backgroundColor: Colors.themeColor,
  },
  addButton1: {
    height: SH(30),
    borderRadius: SW(4),
    backgroundColor: Colors.themeColor,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    backgroundColor: '',
  },
  cardContent: {
    flex: 1,
  },
  skeletonLine: {
    height: SH(15),
    backgroundColor: '#E0E0E0',
    marginBottom: SH(5),
    borderRadius: SW(4),
    width: '100%',
  },
  skeletonLine1: {
    height: SH(15),
    backgroundColor: '#E0E0E0',
    marginBottom: SH(5),
    borderRadius: SW(4),
    width: '50%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SW(25),
    paddingVertical: SH(20),
  },
  errorText: {
    fontSize: SF(16),
    fontFamily: Fonts.MEDIUM,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: SH(15),
  },
  retryButton: {
    height: SH(40),
    borderRadius: SW(8),
    backgroundColor: Colors.themeColor,
    width: SW(120),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SW(25),
    paddingVertical: SH(20),
    marginTop: 70,
  },
  emptyText: {
    fontSize: SF(16),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    textAlign: 'center',
  },
});