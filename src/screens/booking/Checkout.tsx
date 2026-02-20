import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useMemo, useState, } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons, LoadingComp } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceForModal from '@components/provider/ServiceForModal';
import { ServiceSummeryCard, PaymentMethodModal } from '@components';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { queryClient } from '@services/api';
import { useCreateBooking } from '@services/api/queries/appQueries';
import { handleApiError, handleSuccessToast, handleApiFailureResponse } from '@utils/apiHelpers';
import { formatAddress } from '@utils/tools';

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
  // Only atHome needs address (for self: select address screen; for other: address in other person details)
  const needsAddress = deliveryMode === 'atHome';
  // Address required in other person details only when atHome + other
  const otherPersonAddressRequired = deliveryMode === 'atHome';

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
      // Any case: service for other → need other person details → navigate to ADD_OTHER_PERSON_DETAIL
      navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
        addressRequired: otherPersonAddressRequired,
        onSelect: (val: any) => {
          setOtherPersonDetails(val);
          setSelectedAddress(val?.address ?? null);
        },
      });
      setSelectedAddress(null);
    } else {
      setOtherPersonDetails(null);
      setSelectedAddress(null);
    }
    setShowServiceForModal(false);
  };

  const navigateToAddOtherPersonDetail = () => {
    navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
      addressRequired: otherPersonAddressRequired,
      onSelect: (val: any) => {
        setOtherPersonDetails(val);
        setSelectedAddress(val?.address ?? null);
      },
    });
  };




  const handleAddAddress = () => {
    if (serviceFor === 'self') {
      // atHome + self → select address screen
      if (needsAddress) {
        navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS, {
          onSelect: (val: any) => setSelectedAddress(val),
        });
      }
    } else {
      // serviceFor other → add other person details (address optional/mandatory per deliveryMode)
      navigateToAddOtherPersonDetail();
    }
  };



 

  const isFormValid = () => {
    // onPremises / online + self: no address, no other person needed
    if ((deliveryMode === 'onPremises' || deliveryMode === 'online') && serviceFor === 'self') {
      return true;
    }

    // atHome + self: need selected address
    if (needsAddress && serviceFor === 'self') {
      return !!selectedAddress;
    }

    // serviceFor other: need other person details (name, email, phone)
    if (serviceFor === 'other') {
      console.log('otherPersonDetails', otherPersonDetails);
      if (!otherPersonDetails?.name || !otherPersonDetails?.email || !otherPersonDetails?.phone) {
        return false;
      }
      // atHome + other: address mandatory in other person details
      if (otherPersonAddressRequired && !otherPersonDetails?.address) return false;
      return true;
    }
    return true;
  };

  console.log('otherPersonDetails', isFormValid());

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
 
    const servicesForFinal = (Array.isArray(selectedServices) ? selectedServices : [])
      .filter((service: any) => service != null)
      .map((service: any) => ({
        serviceId: service?._id,
        addOnIds: (service?.selectedAddOns || []).filter((a: any) => a != null).map((addOn: any) => addOn?._id).filter(Boolean) || [],
        promotionOfferId: service?.selectedOfferId || null,
      }));

    const fbookingData = {
      spId: bookingData?.providerData?._id,
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
          // Invalidate booking list so it refetches when we navigate there
          queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
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
// console.log('otherPersonDetails', otherPersonDetails);
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
              <CustomText style={styles.summaryValue}>${(Number.isFinite(bookingData?.totalPrice) ? bookingData.totalPrice : 0).toFixed(2)}</CustomText>
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


        {/* Address (atHome + self) or Other Person Details (serviceFor other) */}
        {(needsAddress && serviceFor === 'self') || serviceFor === 'other' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CustomText style={styles.sectionTitle}>
                {serviceFor === 'other' ? (t('checkout.otherPersonDetails') || 'Other Person Details') : t('checkout.yourAddress') || 'Your Address'}
              </CustomText>
              <Pressable onPress={handleAddAddress}>
                <CustomText style={styles.changeLink}>
                  {serviceFor === 'other'
                    ? (otherPersonDetails ? (t('checkout.changeAddress') || 'Change') : (t('checkout.addAddress') || 'Add other person details'))
                    : selectedAddress ? t('checkout.changeAddress') : t('checkout.addAddress')}
                </CustomText>
              </Pressable>
            </View>
            {serviceFor === 'other' ? (
              otherPersonDetails ? (
                <View style={styles.addressCard}>
                  <CustomText style={styles.addressTitle}>{otherPersonDetails.name}</CustomText>
                  <CustomText style={styles.addressText}>{otherPersonDetails.email}</CustomText>
                  <CustomText style={styles.addressPhone}>{otherPersonDetails.countryCode} {otherPersonDetails.phone}</CustomText>
                  {otherPersonDetails.address && (
                    <CustomText style={styles.addressText}>{formatAddress({ line1: otherPersonDetails?.address?.line1, line2: otherPersonDetails?.address?.line2, landmark: otherPersonDetails?.address?.landmark, pincode: otherPersonDetails?.address?.pincode, city: otherPersonDetails?.address?.city?.name, country: otherPersonDetails?.address?.country?.name })}</CustomText>
                  )}
                </View>
              ) : (
                <View style={styles.emptyAddressCard}>
                  <CustomText style={styles.emptyAddressText}>
                    {t('checkout.addOtherPersonDetailsPrompt') || 'Add other person details to continue'}
                  </CustomText>
                </View>
              )
            ) : selectedAddress ? (
              <View style={styles.addressCard}>
                <CustomText style={styles.addressTitle}>{selectedAddress.name}</CustomText>
                <CustomText style={styles.addressText}>{
                  // @ts-ignore
                formatAddress({ line1: selectedAddress.line1 ?? '', line2: selectedAddress.line2 ?? '', landmark: selectedAddress.landmark ?? '', pincode: selectedAddress.pincode ?? '', city: selectedAddress.city?.name ?? '', country: selectedAddress.country?.name ?? '' })}</CustomText>
                <CustomText style={styles.addressPhone}>{selectedAddress.contact}</CustomText>
              </View>
            ) : (
              <View style={styles.emptyAddressCard}>
                <CustomText style={styles.emptyAddressText}>No address selected</CustomText>
              </View>
            )}
          </View>
        ) : null}

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
