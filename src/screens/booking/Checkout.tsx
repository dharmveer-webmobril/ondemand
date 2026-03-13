import { useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, LoadingComp } from '@components/common';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { queryClient } from '@services/api';
import {
  InitiateBookingPaymentRequest,
  useConfirmBookingPayment,
  useCreateBooking,
  useGetWallet,
  useInitiateBookingPayment,
} from '@services/api/queries/appQueries';
import {
  handleApiError,
  handleApiFailureResponse,
  handleSuccessToast,
} from '@utils/apiHelpers';
import { useThemeContext } from '@utils/theme';
import { usePaymentSheet } from '@stripe/stripe-react-native';
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

type GatewayPaymentMethod = Extract<BookingPaymentMethod, 'paypal' | 'stripe'>;

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
  const { mutateAsync: initiatePayment, isPending: isInitiatingPayment } =
    useInitiateBookingPayment();
  const { mutateAsync: confirmPayment, isPending: isConfirmingPayment } =
    useConfirmBookingPayment();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

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
  const isLoading = isCreatingBooking || isInitiatingPayment || isConfirmingPayment;
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

  const isSuccessfulPaymentInitiation = (response: any) => {
    const hasPaymentData =
      !!response?.ResponseData?.transaction ||
      !!response?.ResponseData?.gatewayTransaction ||
      !!response?.ResponseData?.paymentIntent;

    return (response?.succeeded || response?.ResponseCode === 200) && hasPaymentData;
  };

  const getPaymentResponseDetails = (response: any) => {
    const transactionId =
      response?.ResponseData?.transaction?.transactionId ??
      response?.ResponseData?.gatewayTransaction?.transactionId ??
      null;

    const clientSecret =
      response?.ResponseData?.paymentIntent?.client_secret ??
      response?.ResponseData?.gatewayTransaction?.gatewayResponse?.client_secret ??
      null;

    return { transactionId, clientSecret };
  };

  const handleStripePayment = async (
    bookingId: string,
    transactionId: string | null,
    clientSecret: string | null,
  ) => {
    if (!clientSecret) {
      return false;
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Squedio',
    });

    if (initError) {
      handleApiError(initError);
      return false;
    }

    const { error: presentError, didCancel } = await presentPaymentSheet();

    if (transactionId) {
      await confirmPayment({ transactionId, bookingId });
    }

    if (presentError) {
      handleApiError(presentError);
      return false;
    }

    if (didCancel) {
      handleApiError(new Error('Payment cancelled'));
      return false;
    }

    return true;

  };

  const confirmGatewayPayment = async (
    selectedPaymentMethod: GatewayPaymentMethod,
    bookingId: string,
    transactionId: string | null,
    clientSecret: string | null,
  ) => {

    if (selectedPaymentMethod === 'stripe') {
      return handleStripePayment(bookingId, transactionId, clientSecret);
    }

    // if (transactionId) {
    //   await confirmPayment({ transactionId, bookingId });
    // }

    return true;
  };

  const processGatewayPayment = async (
    bookingId: string,
    selectedPaymentMethod: GatewayPaymentMethod,
    walletAmountUsed: number,
  ) => {
    const paymentRequest: InitiateBookingPaymentRequest = {
      bookingId,
      amount: totalPrice,
      paymentGateway: selectedPaymentMethod,
      paymentMethod: 'card',
      useWallet: walletAmountUsed > 0,
      walletAmount: walletAmountUsed,
    };

    const initiateRes = await initiatePayment(paymentRequest);
    console.log('initiateRes------', initiateRes, paymentRequest);

    if (!isSuccessfulPaymentInitiation(initiateRes)) {
      handleApiFailureResponse('No transaction or payment intent found', t('checkout.failedToCreateBooking'));
      return null;
    }

    const { transactionId, clientSecret } = getPaymentResponseDetails(initiateRes);
    console.log('transactionId---------------- 272', transactionId, clientSecret);
    const paymentCompleted = await confirmGatewayPayment(
      selectedPaymentMethod,
      bookingId,
      transactionId,
      clientSecret,
    );

    if (!paymentCompleted) {
      return null;
    }

    return initiateRes;
  };

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
      try {
        const initiateRes = await processGatewayPayment(
          bookingId,
          selectedPaymentMethod as GatewayPaymentMethod,
          walletAmountUsed,
        );

        if (!initiateRes) {
          return;
        }

        handleSuccessToast(
          initiateRes?.ResponseMessage ||
          response?.ResponseMessage ||
          t('checkout.bookingCreatedSuccess'),
        );
      } catch (error) {
        handleApiError(error);
        return;
      }
    } else {
      handleSuccessToast(response?.ResponseMessage || t('checkout.bookingCreatedSuccess'));
    }

    invalidateCheckoutQueries();
    setTimeout(() => {
      navigateToBookingList(payload);
    }, 800);
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
