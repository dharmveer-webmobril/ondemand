import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useMemo, useState, } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons, LoadingComp } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceForModal from '@components/provider/ServiceForModal';
import { ServiceSummeryCard, PaymentMethodModal } from '@components';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useCreateBooking } from '@services/api/queries/appQueries';
import { handleApiError, handleSuccessToast, handleApiFailureResponse } from '@utils/apiHelpers';

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



export default function Checkout() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const bookingData = route.params?.bookingData || {};
  const deliveryMode = bookingData.deliveryMode;
  const selectedServices = bookingData.selectedServices || [];
  // const needsAddress = deliveryMode === 'atHome' || deliveryMode === 'onPremises';
  const needsAddress = deliveryMode === 'atHome';

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  // Service for state
  const [showServiceForModal, setShowServiceForModal] = useState(false);
  const [serviceFor, setServiceFor] = useState<'self' | 'other'>('self');

  // Other person details state
  const [otherPersonDetails, setOtherPersonDetails] = useState<any>(null);

  // Payment type state
  const [paymentType, setPaymentType] = useState<'paypal' | 'stripe' | 'cash'>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Booking mutation
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();




  const handleServiceForSelect = (selected: 'self' | 'other') => {
    if (serviceFor === selected) return;
    setServiceFor(selected);
    if (selected === 'other') {
      needsAddress && navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
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
      needsAddress && navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS, {
        onSelect: (val: any) => {
          setSelectedAddress(val);
        }
      });
    } else {
      needsAddress && navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
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
    if (!needsAddress && serviceFor === 'other') {
      if (!otherPersonDetails?.name || !otherPersonDetails?.email || !otherPersonDetails?.mobile) {
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
    // Show payment method modal first
    setShowPaymentModal(true);
  };

  const handlePaymentMethodConfirm = (selectedPaymentMethod: 'paypal' | 'stripe' | 'cash') => {
    setPaymentType(selectedPaymentMethod);
    setShowPaymentModal(false);
    // Proceed with booking after payment method is selected
    submitBooking(selectedPaymentMethod);
  };

  const submitBooking = (selectedPaymentMethod: 'paypal' | 'stripe' | 'cash') => {
    // const finalBookingData = {
    //   spId: bookingData.providerData._id,
    //   services: selectedServices.map((service: any) => ({
    //     serviceId: service._id,
    //     addOnIds: service.selectedAddOns?.map((addOn: any) => addOn._id) || [],
    //     promotionOfferId: service.selectedOfferId || null,
    //   })),
    //   bookedFor: serviceFor,
    //   addressId: selectedAddress?._id,
    //   ...bookingData,
    //   address: selectedAddress,
    //   serviceFor,
    //   ...(serviceFor === 'other' && {
    //     otherPerson: {
    //       name: otherPersonDetails.name,
    //       email: otherPersonDetails.email,
    //       mobile: otherPersonDetails.mobile,
    //       countryCode: otherPersonDetails.countryCode,
    //       address: otherPersonDetails.address,
    //     },
    //   }),
    // };

    const servicesForFinal = selectedServices.map((service: any) => ({
      serviceId: service._id,
      addOnIds: service.selectedAddOns?.map((addOn: any) => addOn._id) || [],
      promotionOfferId: service.selectedOfferId || null,
    }));

    const fbookingData = {
      spId: bookingData.providerData._id,
      services: servicesForFinal,
      bookedFor: serviceFor,
      addressId: selectedAddress?._id,
      otherDetails: otherPersonDetails ? {
        name: otherPersonDetails?.name,
        email: otherPersonDetails?.email,
        contact: otherPersonDetails?.countryCode + ' ' + otherPersonDetails?.phone,
        countryCode: otherPersonDetails?.countryCode,
      } : null,
      date: bookingData.date,
      time: bookingData.timeSlot,
      paymentType: selectedPaymentMethod === 'paypal' ? 'paypal' : selectedPaymentMethod === 'stripe' ? 'stripe' : 'cash',
      // remark: "Please ring the doorbell",
      preferences: [bookingData.deliveryMode]
    };

    console.log('Final Booking Data:', JSON.stringify(fbookingData, null, 2));

    // API call to create booking
    createBooking(fbookingData, {
      onSuccess: (response) => {
        console.log('Booking created successfully:', response);
        if (response?.succeeded || response?.ResponseData) {
          const successMessage = response?.ResponseMessage || t('checkout.bookingCreatedSuccess');
          handleSuccessToast(successMessage);
          setTimeout(() => {
            // Navigate to BookingList tab using nested navigation
            navigation.navigate(SCREEN_NAMES.HOME, {
              screen: SCREEN_NAMES.BOOKING_LIST,
              params: { bookingData: fbookingData },
            });
          }, 800);
        } else {
          handleApiFailureResponse(response, t('checkout.failedToCreateBooking'));
        }
      },
      onError: (error) => {
        console.error('Booking creation error:', error);
        handleApiError(error);
      },
    });
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('checkout.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ marginHorizontal: theme.SW(20) }}
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

        {/* Selected Services - Hide offers by passing different pageName */}
        {selectedServices && selectedServices.length > 0 && (
          <ServiceSummeryCard
            pageName={'checkout'}
            services={selectedServices}
            onRemoveService={() => { }}
            onAddAddOns={() => { }}
            onAddService={() => { }}
          />
        )}

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
                {serviceFor === 'self' ? t('checkout.self') : t('checkout.other')}
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
                <CustomText style={styles.changeLink}>{selectedAddress ? t('checkout.changeAddress') : t('checkout.addAddress')}</CustomText>
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
          title={t('checkout.confirmBooking')}
          onPress={handleConfirmBooking}
          buttonStyle={styles.confirmButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          disable={!isFormValid() || isCreatingBooking}
          isLoading={isCreatingBooking}
        />
      </View>

      {/* Loading Overlay */}
      <LoadingComp visible={isCreatingBooking} />



      {/* Service For Modal */}
      <ServiceForModal
        visible={showServiceForModal}
        onClose={() => setShowServiceForModal(false)}
        onConfirm={handleServiceForSelect}
        selectedServiceFor={serviceFor}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentMethodConfirm}
        selectedPaymentMethod={paymentType}
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
      paddingBottom: SH(90),
    },
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(14),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(8),
    },
    sectionTitle: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(8),
    },
    changeLink: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    summaryCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
      gap: SH(6),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    summaryValue: {
      fontSize: SF(12),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    addressCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
    },
    addressTitle: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(3),
    },
    addressText: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(3),
    },
    addressPhone: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    emptyAddressCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
      alignItems: 'center',
      gap: SH(8),
    },
    emptyAddressText: {
      fontSize: SF(12),
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
      padding: SW(12),
    },
    serviceForContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(10),
    },
    serviceForText: {
      fontSize: SF(14),
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
      paddingVertical: SH(12),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    confirmButton: {
      borderRadius: SF(12),
    },
  });
};
