import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons, LoadingComp, CustomInput } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import ServiceForModal from '@components/provider/ServiceForModal';
import { ServiceSummeryCard, PaymentMethodModal } from '@components';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { queryClient } from '@services/api';
import {
  useCreateBooking,
  useGetWallet,
  useInitiateBookingPayment,
  useConfirmBookingPayment,
} from '@services/api/queries/appQueries';
import { handleApiError, handleSuccessToast, handleApiFailureResponse } from '@utils/apiHelpers';
import { formatAddress } from '@utils/tools';
import { usePaymentSheet } from '@stripe/stripe-react-native';

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

export type PaymentModeKey = 'cash' | 'online' | 'wallet' | 'wallet_partial';

const PAYMENT_MODES: { key: PaymentModeKey; label: string }[] = [
  { key: 'cash', label: 'Pay on site (Cash)' },
  { key: 'online', label: 'Online (Card)' },
  { key: 'wallet', label: 'Wallet (Full)' },
  { key: 'wallet_partial', label: 'Wallet (Partial)' },
];

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

  // Payment mode: cash | online | wallet | wallet_partial
  const [paymentMode, setPaymentMode] = useState<PaymentModeKey>('cash');
  // For online / wallet_partial: which card (stripe/paypal)
  const [paymentType, setPaymentType] = useState<'paypal' | 'stripe' | 'cash'>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Wallet partial: amount user wants to use from wallet
  const [walletPartialAmount, setWalletPartialAmount] = useState<string>('');

  // Wallet balance from API
  const { data: walletData } = useGetWallet();
  const walletBalance = Number(
    walletData?.ResponseData?.balance ?? walletData?.ResponseData?.amount ?? 0,
  ) || 0;

  // Booking and payment mutations
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();
  const { mutateAsync: initiatePayment, isPending: isInitiatingPayment } = useInitiateBookingPayment();
  const { mutateAsync: confirmPayment, isPending: isConfirmingPayment } = useConfirmBookingPayment();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const totalPrice = Number.isFinite(bookingData?.totalPrice) ? Number(bookingData.totalPrice) : 0;
  const walletPartialNum = Math.min(
    walletBalance,
    totalPrice,
    Math.max(0, parseFloat(walletPartialAmount) || 0),
  );
  const remainingAfterWallet = Math.max(0, totalPrice - walletPartialNum);
  const walletFullyCovers = totalPrice <= walletBalance && paymentMode === 'wallet';

  const insufficientWalletBalance =
    (paymentMode === 'wallet' && totalPrice > walletBalance) ||
    (paymentMode === 'wallet_partial' && walletBalance <= 0) ||
    (paymentMode === 'wallet_partial' && (parseFloat(walletPartialAmount) || 0) > walletBalance);

  const handleServiceForSelect = (selected: 'self' | 'other') => {
    if (serviceFor === selected) return;
    setServiceFor(selected);
    if (selected === 'other') {
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
      if (!otherPersonDetails?.name || !otherPersonDetails?.email || !otherPersonDetails?.phone) {
        return false;
      }
      // atHome + other: address mandatory in other person details
      if (otherPersonAddressRequired && !otherPersonDetails?.address) return false;
      return true;
    }
    return true;
  };


  const handleConfirmBooking = () => {
    if (!isFormValid()) return;

    if (paymentMode === 'cash') {
      submitBooking('cash', 0);
      return;
    }
    if (paymentMode === 'wallet') {
      const amountFromWallet = Math.min(walletBalance, totalPrice);
      submitBooking('wallet', amountFromWallet);
      return;
    }
    if (paymentMode === 'online') {
      setShowPaymentModal(true);
      return;
    }
    if (paymentMode === 'wallet_partial') {
      const fromWallet = walletPartialNum;
      if (fromWallet <= 0) return;
      if (remainingAfterWallet <= 0) {
        submitBooking('wallet', fromWallet);
        return;
      }
      setShowPaymentModal(true);
      return;
    }
  };

  const handlePaymentMethodConfirm = (selectedPaymentMethod: 'paypal' | 'stripe' | 'cash') => {
    setPaymentType(selectedPaymentMethod);
    setShowPaymentModal(false);
    const walletUsed = paymentMode === 'wallet_partial' ? walletPartialNum : 0;
    submitBooking(selectedPaymentMethod, walletUsed);
  };

  const submitBooking = (selectedPaymentMethod: 'paypal' | 'stripe' | 'cash' | 'wallet', walletAmountUsed: number = 0) => {
 
    const servicesForFinal = (Array.isArray(selectedServices) ? selectedServices : [])
      .filter((service: any) => service != null)
      .map((service: any) => ({
        serviceId: service?._id,
        addOnIds: (service?.selectedAddOns || []).filter((a: any) => a != null).map((addOn: any) => addOn?._id).filter(Boolean) || [],
        promotionOfferId: service?.selectedOfferId || null,
      }));

    // Create booking uses paymentType: one of ["cash", "online", "wallet", "wallet_partial"]
    const fbookingData = {
      spId: bookingData?.providerData?._id,
      services: servicesForFinal,
      bookedFor: serviceFor,
      addressId: selectedAddress?._id,
      otherDetails: otherPersonDetails
        ? {
            name: otherPersonDetails?.name,
            email: otherPersonDetails?.email,
            contact: otherPersonDetails?.countryCode + ' ' + otherPersonDetails?.phone,
            countryCode: otherPersonDetails?.countryCode,
          }
        : null,
      date: bookingData.date,
      time: bookingData.timeSlot,
      paymentType: paymentMode, // "cash" | "online" | "wallet" | "wallet_partial"
      walletAmountUsed: walletAmountUsed > 0 ? walletAmountUsed : undefined,
      preferences: [bookingData.deliveryMode],
    };

    console.log('Final Booking Data:', JSON.stringify(fbookingData, null, 2));

    const needsGatewayPayment =
      selectedPaymentMethod === 'stripe' || selectedPaymentMethod === 'paypal';
    const amountToCharge = needsGatewayPayment
      ? (paymentMode === 'wallet_partial' ? remainingAfterWallet : totalPrice)
      : 0;

    createBooking(fbookingData, {
      onSuccess: async (response) => {
        if (!response?.succeeded && !response?.ResponseData) {
          handleApiFailureResponse(response, t('checkout.failedToCreateBooking'));
          return;
        }

        const bookingId = response?.ResponseData?.booking?._id ? response?.ResponseData?.booking?._id : null;

        console.log('bookingId------', bookingId);
        console.log('response------', response);

        if (!bookingId) {
          handleSuccessToast(response?.ResponseMessage || t('checkout.bookingCreatedSuccess'));
          queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
          navigation.navigate(SCREEN_NAMES.HOME, {
            screen: SCREEN_NAMES.BOOKING_LIST,
            params: { bookingData: fbookingData },
          });
          return;
        }


        if (needsGatewayPayment && amountToCharge > 0) {
          try {
            const initiateRes = await initiatePayment({
              bookingId,
              amount: amountToCharge,
              paymentGateway: selectedPaymentMethod,
              paymentMethod: 'card',
              useWallet: walletAmountUsed > 0,
            });



            console.log('initiateRes------', initiateRes,{
              bookingId,
              amount: amountToCharge,
              paymentGateway: selectedPaymentMethod,
              paymentMethod: 'card',
              useWallet: walletAmountUsed > 0,
            });


            if (!initiateRes?.succeeded || !initiateRes?.ResponseData?.transaction) {
              handleApiFailureResponse(initiateRes, t('checkout.failedToCreateBooking'));
              return;
            }

            const transactionId =
              initiateRes.ResponseData.transaction._id ??
              initiateRes.ResponseData.transaction.transactionId;
            const clientSecret =
              initiateRes.ResponseData.paymentIntent?.client_secret ??
              initiateRes.ResponseData.transaction?.gatewayResponse?.client_secret;

            if (selectedPaymentMethod === 'stripe' && clientSecret) {
              const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'Squedio',
              });
              if (initError) {
                handleApiError(initError);
                return;
              }
              const { error: presentError, didCancel } = await presentPaymentSheet();
              if (presentError) {
                handleApiError(presentError);
                return;
              }
              if (didCancel) {
                return;
              }
              if (transactionId) {
                await confirmPayment({ transactionId, bookingId });
              }
            } else if (selectedPaymentMethod === 'paypal' && transactionId) {
              await confirmPayment({ transactionId, bookingId });
            }

            handleSuccessToast(
              initiateRes?.ResponseMessage || response?.ResponseMessage || t('checkout.bookingCreatedSuccess'),
            );
          } catch (err) {
            handleApiError(err);
            return;
          }
        } else {
          handleSuccessToast(response?.ResponseMessage || t('checkout.bookingCreatedSuccess'));
        }

        queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
        queryClient.invalidateQueries({ queryKey: ['customerWallet'] });
        setTimeout(() => {
          navigation.navigate(SCREEN_NAMES.HOME, {
            screen: SCREEN_NAMES.BOOKING_LIST,
            params: { bookingData: fbookingData },
          });
        }, 800);
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
              <CustomText style={styles.summaryValue}>${totalPrice.toFixed(2)}</CustomText>
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

        {/* Payment Mode Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Payment</CustomText>
          <View style={styles.paymentModeRow}>
            {PAYMENT_MODES.map(({ key, label }) => {
              const isSelected = paymentMode === key;
              return (
                <Pressable
                  key={key}
                  style={styles.paymentRadioRow}
                  onPress={() => {
                    setPaymentMode(key);
                    if (key !== 'wallet_partial') setWalletPartialAmount('');
                  }}
                >
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                  <CustomText style={styles.paymentRadioLabel}>{label}</CustomText>
                </Pressable>
              );
            })}
          </View>

          {/* Wallet full: show balance + remaining */}
          {paymentMode === 'wallet' && (
            <>
              <View style={styles.walletCard}>
                <View style={styles.walletRow}>
                  <CustomText style={styles.walletLabel}>Wallet balance</CustomText>
                  <CustomText style={styles.walletValue}>${walletBalance.toFixed(2)}</CustomText>
                </View>
                <View style={styles.walletRow}>
                  <CustomText style={styles.walletLabel}>Order total</CustomText>
                  <CustomText style={styles.walletValue}>${totalPrice.toFixed(2)}</CustomText>
                </View>
                <View style={[styles.walletRow, styles.walletRowLast]}>
                  <CustomText style={styles.walletLabelBold}>Remaining</CustomText>
                  <CustomText style={styles.walletValueBold}>
                    {walletFullyCovers ? 'Fully covered' : `$${Math.max(0, totalPrice - walletBalance).toFixed(2)}`}
                  </CustomText>
                </View>
              </View>
              {insufficientWalletBalance && (
                <CustomText style={styles.walletErrorText}>
                  Wallet balance does not have enough amount.
                </CustomText>
              )}
            </>
          )}

          {/* Wallet partial: input + remaining + Stripe/PayPal for remainder */}
          {paymentMode === 'wallet_partial' && (
            <>
              <View style={styles.walletCard}>
                <CustomText style={styles.walletInputLabel}>Amount from wallet (max ${Math.min(walletBalance, totalPrice).toFixed(2)})</CustomText>
                <View style={styles.walletInputWrap}>
                  <CustomInput
                    value={walletPartialAmount}
                    onChangeText={setWalletPartialAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    marginTop={0}
                  />
                </View>
                <View style={styles.walletRow}>
                  <CustomText style={styles.walletLabel}>Wallet balance</CustomText>
                  <CustomText style={styles.walletValue}>${walletBalance.toFixed(2)}</CustomText>
                </View>
                <View style={styles.walletRow}>
                  <CustomText style={styles.walletLabel}>Order total</CustomText>
                  <CustomText style={styles.walletValue}>${totalPrice.toFixed(2)}</CustomText>
                </View>
                <View style={[styles.walletRow, styles.walletRowLast]}>
                  <CustomText style={styles.walletLabelBold}>Remaining (pay by card)</CustomText>
                  <CustomText style={styles.walletValueBold}>${remainingAfterWallet.toFixed(2)}</CustomText>
                </View>
                {remainingAfterWallet > 0 && (
                  <CustomText style={styles.walletHint}>Stripe or PayPal will be used for the remaining amount.</CustomText>
                )}
              </View>
              {insufficientWalletBalance && (
                <CustomText style={styles.walletErrorText}>
                  Wallet balance does not have enough amount.
                </CustomText>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <CustomButton
          title={t('checkout.confirmBooking')}
          onPress={handleConfirmBooking}
          buttonStyle={styles.confirmButton}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          disable={
            !isFormValid() ||
            isCreatingBooking ||
            isInitiatingPayment ||
            isConfirmingPayment ||
            insufficientWalletBalance ||
            (paymentMode === 'wallet_partial' && walletPartialNum <= 0)
          }
          isLoading={isCreatingBooking || isInitiatingPayment || isConfirmingPayment}
        />
      </View>

      {/* Loading Overlay */}
      <LoadingComp visible={isCreatingBooking || isInitiatingPayment || isConfirmingPayment} />



      {/* Service For Modal */}
      <ServiceForModal
        visible={showServiceForModal}
        onClose={() => setShowServiceForModal(false)}
        onConfirm={handleServiceForSelect}
        selectedServiceFor={serviceFor}
      />

      {/* Payment Method Modal - Stripe & PayPal only when online or wallet_partial */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentMethodConfirm}
        selectedPaymentMethod={paymentType}
        allowedMethods={paymentMode === 'online' || paymentMode === 'wallet_partial' ? ['stripe', 'paypal'] : undefined}
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
    paymentModeRow: {
      gap: SH(12),
      marginBottom: SH(8),
    },
    paymentRadioRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    radioButton: {
      width: SF(20),
      height: SF(20),
      borderRadius: SF(10),
      borderWidth: 2,
      borderColor: Colors.gray || '#999',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SW(12),
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
    paymentRadioLabel: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      flex: 1,
    },
    walletCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(14),
      marginTop: SH(10),
      gap: SH(6),
    },
    walletRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    walletRowLast: {
      marginTop: SH(6),
      paddingTop: SH(8),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    walletLabel: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.text,
    },
    walletValue: {
      fontSize: SF(13),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    walletLabelBold: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    walletValueBold: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    walletInputLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(6),
    },
    walletInputWrap: {
      marginBottom: SH(8),
    },
    walletHint: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
      marginTop: SH(6),
    },
    walletErrorText: {
      fontSize: SF(13),
      fontFamily: Fonts.MEDIUM,
      color: Colors.errorText || Colors.red || '#DC3545',
      marginTop: SH(8),
    },
  });
};
