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
  Shimmer,
  SweetaelertModal,
} from '../../component'; // Adjust based on your actual paths
import { Colors, Fonts, handleApiError, handleApiFailureResponse, handleSuccessToast, navigate, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';
import AddressMenu from './AddressMenu';
import { useDeleteAddressMutation, useGetAddressQuery } from '../../redux';

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




  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<any>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);




  const renderSkeleton = () => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardContent}>
          <Shimmer style={styles.skeletonLine1} />
          <Shimmer style={styles.skeletonLine} />
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    console.log('item', item);

    return <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardContent}>
          <AppText style={styles.cardTitle}>{item?.type || ''}</AppText>
          <AppText style={styles.cardSubtitle}>
            {`${item?.apartment || ''}, ${item?.streetAddress || ''}, ${item?.city || ''}, ${item?.state || ''}, ${item?.zip || ''}`}
          </AppText>
        </View>
        <TouchableOpacity style={styles.dotMenu} onPress={() => setSelectedMenu(item?._id)}>
          <AddressMenu
            isBlocked={true}
            onSelect={(val) => {
              onPressMenuOption(val, item);
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
    </View>
  };

  const closeMenu = () => setSelectedMenu(null);


  const [deleteAddress, { isLoading: isDeleteLoading }] = useDeleteAddressMutation();

  const onPressMenuOption = (type: string, data: any = null) => {
    if (type === 'delete') {
      console.log('Selected item for deletion:', data); // Debug log
      setAddressToDelete(data);
      setIsDeletePopup(true);
    }
    if (type === 'edit') {
      console.log('Selected item for deletion:', data); // Debug log
      navigate(RouteName.ADD_ADDRESS, { prevScreen: 'edit-address', addData: data });
    }
  };

  // Delete address handler
  async function deleteMsg() {
    if (!addressToDelete?._id && !addressToDelete?.id) {
      console.log('No valid ID found in addressToDelete:', addressToDelete);
      setIsDeletePopup(false);
      return;
    }
    try {
      const deleteId = addressToDelete._id || addressToDelete.id; // Try both _id and id
      console.log('Calling deleteAddress with ID:', deleteId); // Debug log before mutation
      const response = await deleteAddress({ id: deleteId }).unwrap(); // Pass as object
      console.log('Mutation response:', response); // Debug log after mutation
      if (response?.success) {
        handleSuccessToast(t('myAddress.deleteSuccess', { defaultValue: 'Address deleted successfully' }));
      } else {
        handleApiFailureResponse(response, t('myAddress.deleteFailure', { defaultValue: 'Failed to delete address' }));
      }
    } catch (deleteError) {
      console.log('Delete error:', deleteError); // Debug log for errors
      handleApiError(deleteError);
    } finally {
      setIsDeletePopup(false);
      setAddressToDelete(null);
    }
  }

  return (
    <Container>
      <SweetaelertModal
        message={t('myAddress.confirmDelete', { defaultValue: 'Are you sure you want to delete this?' })}
        visible={isDeletePopup}
        isConfirmType="delete"
        onCancel={() => setIsDeletePopup(false)}
        onOk={() => deleteMsg()}
        isOkButtonLoading={isDeleteLoading}
      />
      <AppHeader
        headerTitle={t('myAddress.title', { defaultValue: 'My Address' })}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />



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
          title={t('myAddress.addNewAddress', { defaultValue: 'Add New Address' })}
          onPress={() => navigate(RouteName.ADD_ADDRESS, { prevScreen: 'my-address' })}
          buttonStyle={styles.addButton}
          textColor={Colors.textWhite}
        />
      </View>}
      {selectedMenu && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}
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
  addButton: {
    height: SH(48),
    borderRadius: SW(8),
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
    marginTop:70,
  },
  emptyText: {
    fontSize: SF(16),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    textAlign: 'center',
  },
});