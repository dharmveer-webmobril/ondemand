import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useMemo, useState, } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceForModal from '@components/provider/ServiceForModal';
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



export default function BookingSummery() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const bookingData = route.params?.bookingData || {};
  const deliveryMode = bookingData.deliveryMode;
  const needsAddress = deliveryMode === 'atHome' || deliveryMode === 'onPremises';

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  // Service for state
  const [showServiceForModal, setShowServiceForModal] = useState(false);
  const [serviceFor, setServiceFor] = useState<'self' | 'other'>('self');

  // Other person details state
  const [otherPersonDetails, setOtherPersonDetails] = useState<any>({
    name: '',
    email: '',
    mobile: '',
    countryCode: '+1',
    address: undefined,
  });




  const handleServiceForSelect = (selected: 'self' | 'other') => {
    if (serviceFor === selected) return;
    setServiceFor(selected);
    if (selected === 'other') {
      navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
        onSelect: (val: any) => {
          setOtherPersonDetails(val);
          setSelectedAddress(val?.address);
        }
      });
      setSelectedAddress(null);
    } else {
      setSelectedAddress(null);
    }
    setShowServiceForModal(false);
  };




  const handleAddAddress = () => {
    if (serviceFor === 'self') {
      navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS, {
        onSelect: (val: any) => {
          setSelectedAddress(val);
        }
      });
    } else {
      navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS, {
        onSelect: (val: any) => {
          setSelectedAddress(val);
        }
      });
    }
  };



  const formatAddress = (address: Address) => {
    const parts = [address.line1];
    if (address.line2) parts.push(address.line2);
    if (address.landmark) parts.push(address.landmark);
    return parts.join(', ');
  };

  const isFormValid = () => {
    if (needsAddress && !selectedAddress) return false;
    if (serviceFor === 'other') {
      if (!otherPersonDetails.name || !otherPersonDetails.email || !otherPersonDetails.mobile) {
        return false;
      }
      if (needsAddress && !otherPersonDetails.address) return false;
    }
    return true;
  };

  const handleConfirmBooking = () => {
    if (!isFormValid()) {
      return;
    }

    const finalBookingData = {
      ...bookingData,
      address: selectedAddress,
      serviceFor,
      ...(serviceFor === 'other' && {
        otherPerson: {
          name: otherPersonDetails.name,
          email: otherPersonDetails.email,
          mobile: otherPersonDetails.mobile,
          countryCode: otherPersonDetails.countryCode,
          address: otherPersonDetails.address,
        },
      }),
    };

    console.log('Final Booking Data:', JSON.stringify(finalBookingData, null, 2));
    // TODO: API call to create booking
    // navigation.goBack();
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title="Checkout"
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider and Appointment Summary */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Appointment Details</CustomText>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>Date:</CustomText>
              <CustomText style={styles.summaryValue}>{bookingData.date}</CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>Time:</CustomText>
              <CustomText style={styles.summaryValue}>{bookingData.timeSlot}</CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>Total:</CustomText>
              <CustomText style={styles.summaryValue}>${bookingData.totalPrice?.toFixed(2)}</CustomText>
            </View>
          </View>
        </View>



        {/* Service For Selection =============*/}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Service For</CustomText>
          <Pressable
            style={styles.serviceForCard}
            onPress={() => setShowServiceForModal(true)}
          >
            <View style={styles.serviceForContent}>
              <VectoreIcons
                name={serviceFor === 'self' ? 'person' : 'people'}
                icon="Ionicons"
                size={theme.SF(20)}
                color={theme.colors.primary}
              />
              <CustomText style={styles.serviceForText}>
                {serviceFor === 'self' ? 'Self' : 'Other'}
              </CustomText>
            </View>
            <VectoreIcons
              name="chevron-forward"
              icon="Ionicons"
              size={theme.SF(20)}
              color={theme.colors.lightText}
            />
          </Pressable>
        </View>


        {/* Address Selection (for atHome or onPremises) */}
        {needsAddress && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CustomText style={styles.sectionTitle}>Your Address</CustomText>
              <Pressable onPress={handleAddAddress}>
                <CustomText style={styles.changeLink}>{selectedAddress ? 'Change' : 'Add Address'}</CustomText>
              </Pressable>
            </View>
            {selectedAddress ? (
              <View style={styles.addressCard}>
                <CustomText style={styles.addressTitle}>{selectedAddress.name}</CustomText>
                <CustomText style={styles.addressText}>{formatAddress(selectedAddress)}</CustomText>
                <CustomText style={styles.addressPhone}>{selectedAddress.contact}</CustomText>
              </View>
            ) : (
              <View style={styles.emptyAddressCard}>
                <CustomText style={styles.emptyAddressText}>No address selected</CustomText>

              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          buttonStyle={styles.confirmButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          disable={!isFormValid()}
        />
      </View>



      {/* Service For Modal */}
      <ServiceForModal
        visible={showServiceForModal}
        onClose={() => setShowServiceForModal(false)}
        onConfirm={handleServiceForSelect}
        selectedServiceFor={serviceFor}
      />


    </Container>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: SH(100),
    },
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(20),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(12),
    },
    sectionTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(12),
    },
    changeLink: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    summaryCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(16),
      gap: SH(8),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    summaryValue: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    addressCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(16),
    },
    addressTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(4),
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
    emptyAddressCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(16),
      alignItems: 'center',
      gap: SH(12),
    },
    emptyAddressText: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    addAddressButton: {
      borderRadius: SF(8),
      paddingHorizontal: SW(20),
    },
    serviceForCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(16),
    },
    serviceForContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(12),
    },
    serviceForText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    inputWrapper: {
      marginBottom: SH(16),
    },
    inputLabel: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(8),
    },
    phoneInputContainer: {
      flexDirection: 'row',
      gap: SW(12),
      marginTop: SH(8),
    },
    countryCodeButton: {
      backgroundColor: Colors.white,
      borderRadius: SF(8),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
    },
    phoneInput: {
      flex: 1,
    },
    addressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(8),
    },
    selectAddressButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(16),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      borderStyle: 'dashed',
    },
    selectAddressText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.white,
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    confirmButton: {
      borderRadius: SF(12),
    },
  });
};
