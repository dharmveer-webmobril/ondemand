import { View, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';
import { useGetCustomerAddresses } from '@services/index';
import { useNavigation } from '@react-navigation/native';
import SCREEN_NAMES from '@navigation/ScreenNames';

type Address = {
  _id: string;
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  country: string;
  pincode: string;
  contact: string;
  addressType: 'home' | 'office' | 'other';
  isDefault?: boolean;
};

type AddressSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: Address) => void;
  selectedAddressId?: string;
};

export default function AddressSelectionModal({
  visible,
  onClose,
  onConfirm,
  selectedAddressId,
}: AddressSelectionModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedAddressId);

  const {
    data: addressesData,
    isLoading,
    refetch,
  } = useGetCustomerAddresses();

  const addresses = addressesData?.ResponseData || [];
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];

  // Set default address when modal opens
  useEffect(() => {
    if (visible && !selectedId && defaultAddress) {
      setSelectedId(defaultAddress._id);
    }
  }, [visible, defaultAddress, selectedId]);

  const handleSelectAddress = (addressId: string) => {
    setSelectedId(addressId);
  };

  const handleConfirm = () => {
    const selectedAddress = addresses.find((addr) => addr._id === selectedId);
    if (selectedAddress) {
      onConfirm(selectedAddress);
      onClose();
    }
  };

  const handleAddNewAddress = () => {
    navigation.navigate(SCREEN_NAMES.ADD_ADDRESS as never, { 
      addData: null,
    } as never);
  };

  // Refetch addresses when modal becomes visible
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  const formatAddress = (address: Address) => {
    const parts = [address.line1];
    if (address.line2) parts.push(address.line2);
    if (address.landmark) parts.push(address.landmark);
    return parts.join(', ');
  };

  const renderAddressItem = ({ item }: { item: Address }) => {
    const isSelected = selectedId === item._id;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.addressItem,
          isSelected && styles.selectedAddressItem,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleSelectAddress(item._id)}
      >
        <View style={styles.addressContent}>
          <View style={styles.radioButtonContainer}>
            <View
              style={[
                styles.radioButton,
                isSelected && styles.radioButtonSelected,
              ]}
            >
              {isSelected && <View style={styles.radioButtonInner} />}
            </View>
          </View>
          <View style={styles.addressInfo}>
            <CustomText
              style={[
                styles.addressTitle,
                isSelected && styles.selectedAddressTitle,
              ]}
            >
              {item.name}
            </CustomText>
            <CustomText style={styles.addressText}>
              {formatAddress(item)}
            </CustomText>
            <CustomText style={styles.addressPhone}>{item.contact}</CustomText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <View style={styles.header}>
              <CustomText style={styles.title}>Select Address</CustomText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <Pressable style={styles.addButton} onPress={handleAddNewAddress}>
              <CustomText style={styles.addButtonText}>+ Add New Address</CustomText>
            </Pressable>

            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <CustomText style={styles.loaderText}>Loading addresses...</CustomText>
              </View>
            ) : addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <CustomText style={styles.emptyText}>No addresses found</CustomText>
                <CustomText style={styles.emptySubtext}>
                  Please add an address to continue
                </CustomText>
              </View>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={(item) => item._id}
                renderItem={renderAddressItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}

            <CustomButton
              title={t('category.confirm') || 'Confirm'}
              onPress={handleConfirm}
              buttonStyle={styles.confirmButton}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.whitetext}
              disable={!selectedId || addresses.length === 0}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      maxHeight: '80%',
      flex: 1,
      borderTopLeftRadius: SF(20),
      borderTopRightRadius: SF(20),
      backgroundColor: Colors.white,
      paddingTop: SH(20),
      paddingBottom: SH(30),
      paddingHorizontal: SW(20),
    },
    content: {
      flex: 1,
      gap: SH(20),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: SF(18),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: SW(4),
    },
    addButton: {
      paddingVertical: SH(12),
      paddingHorizontal: SW(16),
      backgroundColor: Colors.primary,
      borderRadius: SF(8),
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.white,
    },
    listContent: {
      paddingVertical: SH(10),
      gap: SH(12),
    },
    addressItem: {
      padding: SW(16),
      borderRadius: SF(12),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      backgroundColor: Colors.background || '#F5F5F5',
    },
    selectedAddressItem: {
      borderColor: Colors.primary,
      backgroundColor: Colors.secondary || '#E3F2FD',
    },
    addressContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(12),
    },
    radioButtonContainer: {
      paddingTop: SH(2),
    },
    radioButton: {
      width: SF(20),
      height: SF(20),
      borderRadius: SF(10),
      borderWidth: 2,
      borderColor: Colors.gray || '#999',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      borderColor: Colors.primary,
    },
    radioButtonInner: {
      width: SF(10),
      height: SF(10),
      borderRadius: SF(5),
      backgroundColor: Colors.primary,
    },
    addressInfo: {
      flex: 1,
    },
    addressTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(4),
    },
    selectedAddressTitle: {
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    addressText: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(4),
    },
    addressPhone: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    loaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SH(40),
      gap: SW(12),
    },
    loaderText: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    emptyContainer: {
      paddingVertical: SH(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(8),
    },
    emptySubtext: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    confirmButton: {
      borderRadius: SF(12),
      marginTop: SH(10),
    },
  });
};
