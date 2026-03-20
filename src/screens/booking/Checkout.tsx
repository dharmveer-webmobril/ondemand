import { useMemo, useState, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, LoadingComp } from '@components/common';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { queryClient } from '@services/api';
import { useCreateBooking, useGetWallet } from '@services/api/queries/appQueries';
import { useGatewayPayment } from '@services/payment';
import {
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
} from '@utils/apiHelpers';
import { useThemeContext } from '@utils/theme';
import { createStyles } from './Checkout.styles';
import {
  AddressSection,
  AppointmentDetailsSection,
  CheckoutFooter,
  CheckoutModals,
  PaymentSection,
  SelectedServicesSection,
  ServiceForSection,
} from './CheckoutSections';
import {
  Address,
  BookingPaymentMethod,
  OtherPersonDetails,
  PaymentModeKey,
  buildBookingPayload,
  getGatewayChargeAmount,
  getRemainingAfterWallet,
  getWalletPartialAmount,
  hasInvalidPartialWalletAmount,
  hasInsufficientWalletBalance,
  isCheckoutFormValid,
  isWalletFullyCovered,
  shouldUseGatewayPayment,
} from './checkoutHelpers';

export default function Checkout() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const bookingData = route.params?.bookingData || {};
  const deliveryMode = bookingData.deliveryMode;
  const selectedServices = bookingData.selectedServices || [];
  const needsAddress = deliveryMode === 'atHome';
  const otherPersonAddressRequired = deliveryMode === 'atHome';

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showServiceForModal, setShowServiceForModal] = useState(false);
  const [serviceFor, setServiceFor] = useState<'self' | 'other'>('self');
  const [otherPersonDetails, setOtherPersonDetails] = useState<OtherPersonDetails>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentModeKey>('cash');
  const [paymentType, setPaymentType] = useState<'paypal' | 'stripe' | 'cash'>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [walletPartialAmount, setWalletPartialAmount] = useState('');

  const { data: walletData } = useGetWallet();
  const walletBalance =
    Number(walletData?.ResponseData?.balance ?? walletData?.ResponseData?.amount ?? 0) || 0;

  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();

  const { runGatewayPayment, isPending: isGatewayPaymentPending } = useGatewayPayment();

  const totalPrice = Number.isFinite(bookingData?.totalPrice)
    ? Number(bookingData.totalPrice)
    : 0;

  const walletPartialNum = getWalletPartialAmount(
    walletBalance,
    totalPrice,
    walletPartialAmount,
  );

  const remainingAfterWallet = getRemainingAfterWallet(totalPrice, walletPartialNum);

  const walletFullyCovers = isWalletFullyCovered(totalPrice, walletBalance, paymentMode);

  const insufficientWalletBalance = hasInsufficientWalletBalance(
    paymentMode,
    totalPrice,
    walletBalance,
    walletPartialAmount,
  );

  const invalidPartialWalletAmount = hasInvalidPartialWalletAmount(
    paymentMode,
    totalPrice,
    walletPartialAmount,
  );

  const isLoading = isCreatingBooking || isGatewayPaymentPending;
  const isFormValid = isCheckoutFormValid({
    deliveryMode,
    needsAddress,
    serviceFor,
    selectedAddress,
    otherPersonDetails,
    otherPersonAddressRequired,
  });

  const handleOtherPersonSelect = (value: any) => {
    setOtherPersonDetails(value);
    setSelectedAddress(value?.address ?? null);
  };

  const openOtherPersonDetailsScreen = () => {
    navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
      addressRequired: otherPersonAddressRequired,
      onSelect: handleOtherPersonSelect,
    });
  };

  const handleServiceForSelect = (selected: 'self' | 'other') => {
    if (serviceFor === selected) {
      return;
    }

    setServiceFor(selected);

    if (selected === 'other') {
      openOtherPersonDetailsScreen();
      setSelectedAddress(null);
    } else {
      setOtherPersonDetails(null);
      setSelectedAddress(null);
    }

    setShowServiceForModal(false);
  };

  const handleAddAddress = () => {
    if (serviceFor === 'self') {
      if (needsAddress) {
        navigation.navigate(SCREEN_NAMES.SELECT_ADDRESS, {
          onSelect: (value: any) => setSelectedAddress(value),
        });
      }
      return;
    }

    openOtherPersonDetailsScreen();
  };

  const navigateToBookingList = (payload: any) => {
    navigation.navigate(SCREEN_NAMES.HOME, {
      screen: SCREEN_NAMES.BOOKING_LIST,
      params: { bookingData: payload },
    });
  };

  const invalidateCheckoutQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
    queryClient.invalidateQueries({ queryKey: ['customerWallet'] });
  };

  // Handle return from PayPal WebView (success/cancel/failure)
  useFocusEffect(
    useCallback(() => {
      const result = route.params?.paymentResult;
      const payload = route.params?.checkoutPayload;
      const message = route.params?.paymentMessage;
      if (result === 'success' && payload) {
        handleSuccessToast(message || t('checkout.bookingCreatedSuccess'));
        invalidateCheckoutQueries();
        setTimeout(() => navigateToBookingList(payload), 300);
        navigation.setParams({ paymentResult: undefined, checkoutPayload: undefined, paymentMessage: undefined });
      }
      if (result === 'failure' && route.params?.paymentError) {
        handleApiFailureResponse(route.params.paymentError, t('checkout.failedToCreateBooking'));
        navigation.setParams({ paymentResult: undefined, paymentError: undefined });
      }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [route.params?.paymentResult, route.params?.checkoutPayload, route.params?.paymentMessage, route.params?.paymentError]),
  );

  const handleBookingCreated = async (
    response: any,
    payload: any,
    selectedPaymentMethod: BookingPaymentMethod,
    walletAmountUsed: number,
  ) => {
    if (!response?.succeeded && !response?.ResponseData) {
      handleApiFailureResponse(response, t('checkout.failedToCreateBooking'));
      return;
    }

    const bookingId = response?.ResponseData?.booking?._id ?? null;

    if (!bookingId) {
      handleSuccessToast(response?.ResponseMessage || t('checkout.bookingCreatedSuccess'));
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      navigateToBookingList(payload);
      return;
    }

    const amountToCharge = getGatewayChargeAmount(
      selectedPaymentMethod,
      paymentMode,
      remainingAfterWallet,
      totalPrice,
    );

    if (shouldUseGatewayPayment(selectedPaymentMethod) && amountToCharge > 0) {
      const walletTransactionId =
        paymentMode === 'wallet_partial'
          ? response?.ResponseData?.walletTransaction?.transactionId ||
            response?.ResponseData?.walletTransactionId ||
            null
          : null;

      runGatewayPayment(navigation, {
        bookingId,
        amount: totalPrice,
        paymentGateway: selectedPaymentMethod as 'stripe' | 'paypal',
        walletAmountUsed,
        walletTransactionId,
        returnTo: SCREEN_NAMES.CHECKOUT,
        returnParams: { bookingData, checkoutPayload: payload },
        handleApiError,
        handleApiFailureResponse,
        failureMessage: t('checkout.failedToCreateBooking'),
        onSuccess: (initiateRes: any) => {
          handleSuccessToast(
            initiateRes?.ResponseMessage ||
              response?.ResponseMessage ||
              t('checkout.bookingCreatedSuccess'),
          );
          invalidateCheckoutQueries();
          setTimeout(() => navigateToBookingList(payload), 800);
        },
        onCancel: () => {
          navigation.navigate(SCREEN_NAMES.BOOKING_DETAIL, { bookingId });
        },
        onError: (_error: any) => {
          console.log('onError------ 227', _error);
          handleApiError(_error);
          setTimeout(() => navigation.navigate(SCREEN_NAMES.BOOKING_DETAIL, { bookingId }), 300);
        },
      });
      return;
    }

    handleSuccessToast(response?.ResponseMessage || t('checkout.bookingCreatedSuccess'));
    invalidateCheckoutQueries();
    setTimeout(() => navigateToBookingList(payload), 800);
  };

  const submitBooking = (
    selectedPaymentMethod: BookingPaymentMethod,
    walletAmountUsed: number = 0,
  ) => {
    const payload = buildBookingPayload({
      bookingData,
      selectedServices,
      serviceFor,
      selectedAddress,
      otherPersonDetails,
      paymentMode,
      walletAmountUsed,
    });

    console.log('Final Booking Data:', JSON.stringify(payload, null, 2));

    createBooking(payload, {
      onSuccess: async (response) => {
        await handleBookingCreated(
          response,
          payload,
          selectedPaymentMethod,
          walletAmountUsed,
        );
      },
      onError: (error) => {
        console.error('Booking creation error:', error);
        handleApiError(error);
      },
    });
  };

  const handleConfirmBooking = () => {
    if (!isFormValid) {
      return;
    }

    if (paymentMode === 'cash') {
      submitBooking('cash', 0);
      return;
    }

    if (paymentMode === 'wallet') {
      submitBooking('wallet', Math.min(walletBalance, totalPrice));
      return;
    }

    if (paymentMode === 'online') {
      setShowPaymentModal(true);
      return;
    }

    if (paymentMode === 'wallet_partial') {
      if (walletPartialNum <= 0 || invalidPartialWalletAmount) {
        return;
      }

      if (remainingAfterWallet <= 0) {
        submitBooking('wallet', walletPartialNum);
        return;
      }

      setShowPaymentModal(true);
    }
  };

  const handlePaymentMethodConfirm = (selectedPaymentMethod: 'paypal' | 'stripe' | 'cash') => {
    setPaymentType(selectedPaymentMethod);
    setShowPaymentModal(false);

    const walletUsed = paymentMode === 'wallet_partial' ? walletPartialNum : 0;
    submitBooking(selectedPaymentMethod, walletUsed);
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


      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        enableOnAndroid={false}
        extraScrollHeight={100}
        // keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >
        <AppointmentDetailsSection
          bookingData={bookingData}
          totalPrice={totalPrice}
          styles={styles}
        />
        <SelectedServicesSection selectedServices={selectedServices} />
        <ServiceForSection
          styles={styles}
          theme={theme}
          t={t}
          serviceFor={serviceFor}
          onPress={() => setShowServiceForModal(true)}
        />
        
        <AddressSection
          styles={styles}
          t={t}
          needsAddress={needsAddress}
          serviceFor={serviceFor}
          otherPersonDetails={otherPersonDetails}
          selectedAddress={selectedAddress}
          onPress={handleAddAddress}
        />

        <PaymentSection
          styles={styles}
          t={t}
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          setWalletPartialAmount={setWalletPartialAmount}
          walletPartialAmount={walletPartialAmount}
          walletBalance={walletBalance}
          totalPrice={totalPrice}
          walletFullyCovers={walletFullyCovers}
          remainingAfterWallet={remainingAfterWallet}
          insufficientWalletBalance={insufficientWalletBalance}
          invalidPartialWalletAmount={invalidPartialWalletAmount}
        />
        <CheckoutFooter
          styles={styles}
          theme={theme}
          t={t}
          onPress={handleConfirmBooking}
          disabled={
            !isFormValid ||
            isLoading ||
            invalidPartialWalletAmount ||
            insufficientWalletBalance ||
            (paymentMode === 'wallet_partial' && walletPartialNum <= 0)
          }
          isLoading={isLoading}
        />
      </KeyboardAwareScrollView>


      <LoadingComp visible={isLoading} />

      <CheckoutModals
        serviceFor={serviceFor}
        showServiceForModal={showServiceForModal}
        showPaymentModal={showPaymentModal}
        closeServiceForModal={() => setShowServiceForModal(false)}
        closePaymentModal={() => setShowPaymentModal(false)}
        onServiceForConfirm={handleServiceForSelect}
        onPaymentMethodConfirm={handlePaymentMethodConfirm}
        paymentType={paymentType}
        paymentMode={paymentMode}
      />
    </Container>
  );
}
