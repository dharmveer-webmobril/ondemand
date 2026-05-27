import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, LoadingComp, SweetAlert, showToast } from '@components/common';
import { KeyboardFormScroll } from '@components/common';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { queryClient } from '@services/api';
import {
  useCreateBooking,
  useCreateRoutineBooking,
  useGetWallet,
} from '@services/api/queries/appQueries';
import { useGatewayPayment } from '@services/payment';
import { handleSuccessToast } from '@utils/apiHelpers';
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
  buildRoutineBookingPayload,
  getBookingIdFromCreateResponse,
  getRoutineAmountFromCreateResponse,
  getRoutineBookingIdFromCreateResponse,
  isRoutineCheckout,
  getRemainingAfterWallet,
  getAtHomeCountryRestriction,
  getWalletPartialAmount,
  hasInvalidPartialWalletAmount,
  hasInsufficientWalletBalance,
  addressMatchesAtHomeCountry,
  phoneCountryMatchesAtHomeCountry,
  isCheckoutFormValid,
  isWalletFullyCovered,
  shouldUseGatewayPayment,
} from './checkoutHelpers';
import BookingPaymentSuccessModal from './BookingPaymentSuccessModal';
import localStorage from '@utils/StorageProvider';

export default function Checkout() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const bookingData = useMemo(
    () => route.params?.bookingData || {},
    [route.params?.bookingData],
  );
  const isRoutine = isRoutineCheckout(bookingData);
  const deliveryMode = bookingData.deliveryMode;
  const selectedServices = bookingData.selectedServices || [];
  const needsAddress = deliveryMode === 'atHome';
  const otherPersonAddressRequired = deliveryMode === 'atHome';
  const atHomeCountryRestriction = useMemo(
    () => (needsAddress ? getAtHomeCountryRestriction(bookingData) : null),
    [bookingData, needsAddress],
  );
  const atHomeCountryName =
    atHomeCountryRestriction?.name ||
    atHomeCountryRestriction?.iso2?.toUpperCase() ||
    '';

  const draft = route.params?.checkoutDraft;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    draft?.selectedAddress ?? null,
  );
  const [showServiceForModal, setShowServiceForModal] = useState(false);
  const [serviceFor, setServiceFor] = useState<'self' | 'other'>(
    draft?.serviceFor ?? 'self',
  );
  const [otherPersonDetails, setOtherPersonDetails] = useState<OtherPersonDetails>(
    draft?.otherPersonDetails ?? null,
  );
  const [paymentMode, setPaymentMode] = useState<PaymentModeKey>(() => {
    const draftMode = draft?.paymentMode;
    if (isRoutine) {
      return draftMode === 'cash' || draftMode === 'online' ? draftMode : 'online';
    }
    return draftMode ?? 'online';
  });
  const [paymentType, setPaymentType] = useState<
    'paypal' | 'stripe' | 'flutterwave' | 'cash'
  >(draft?.paymentType ?? 'stripe');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [walletPartialAmount, setWalletPartialAmount] = useState(
    draft?.walletPartialAmount ?? '',
  );

  const [showPaymentFailedPopup, setShowPaymentFailedPopup] = useState(false);
  const [paymentFailedMessage, setPaymentFailedMessage] = useState<string>('');

  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentSuccessConfirmRes, setPaymentSuccessConfirmRes] = useState<any>(null);
  const paymentSuccessDataRef = useRef<{
    confirmRes: any;
    fallbackPayload: any;
  } | null>(null);

  const showCheckoutError = useCallback(
    (error: any, fallbackMessage: string = t('checkout.failedToCreateBooking')) => {
      const message =
        typeof error === 'string'
          ? error
          : error?.response?.data?.ResponseMessage ||
            error?.response?.data?.message ||
            error?.message ||
            fallbackMessage;

      setPaymentFailedMessage(message);
      setShowPaymentFailedPopup(true);
    },
    [t],
  );

  // Persist draft so data is not lost on payment cancel/back or screen remount.
  useEffect(() => {
    navigation.setParams({
      checkoutDraft: {
        selectedAddress,
        serviceFor,
        otherPersonDetails,
        paymentMode,
        paymentType,
        walletPartialAmount,
      },
    });
  }, [
    navigation,
    selectedAddress,
    serviceFor,
    otherPersonDetails,
    paymentMode,
    paymentType,
    walletPartialAmount,
  ]);

  const { data: walletData } = useGetWallet();
  const walletBalance =
    Number(walletData?.ResponseData?.balance ?? walletData?.ResponseData?.amount ?? 0) || 0;

  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();
  const { mutate: createRoutineBooking, isPending: isCreatingRoutine } =
    useCreateRoutineBooking();

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

  const isLoading =
    isCreatingBooking || isCreatingRoutine || isGatewayPaymentPending;
  const baseFormValid = isCheckoutFormValid({
    deliveryMode,
    needsAddress,
    serviceFor,
    selectedAddress,
    otherPersonDetails,
    otherPersonAddressRequired,
  });
  const selectedAddressCountryValid =
    !needsAddress ||
    serviceFor !== 'self' ||
    addressMatchesAtHomeCountry(selectedAddress, atHomeCountryRestriction);
  const otherAddressCountryValid =
    !needsAddress ||
    serviceFor !== 'other' ||
    addressMatchesAtHomeCountry(
      otherPersonDetails?.address,
      atHomeCountryRestriction,
    );
  const otherPhoneCountryValid =
    !needsAddress ||
    serviceFor !== 'other' ||
    phoneCountryMatchesAtHomeCountry(
      otherPersonDetails?.phoneCountryIso2,
      otherPersonDetails?.countryCode,
      atHomeCountryRestriction,
    );
  const isFormValid =
    baseFormValid &&
    selectedAddressCountryValid &&
    otherAddressCountryValid &&
    otherPhoneCountryValid;

  const showAtHomeCountryRestrictionToast = useCallback(() => {
    showToast({
      type: 'info',
      message: t('checkout.atHomeCountryRestriction', {
        country: atHomeCountryName || t('checkout.sameCountry'),
      }),
    });
  }, [atHomeCountryName, t]);

  const handleOtherPersonSelect = (value: any) => {
    if (
      needsAddress &&
      (!addressMatchesAtHomeCountry(value?.address, atHomeCountryRestriction) ||
        !phoneCountryMatchesAtHomeCountry(
          value?.phoneCountryIso2,
          value?.countryCode,
          atHomeCountryRestriction,
        ))
    ) {
      showAtHomeCountryRestrictionToast();
      return;
    }
    setOtherPersonDetails(value);
    setSelectedAddress(value?.address ?? null);
  };

  const openOtherPersonDetailsScreen = () => {
    navigation.navigate(SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL, {
      addressRequired: otherPersonAddressRequired,
      allowedCountryName: atHomeCountryRestriction?.name,
      allowedCountryIso2: atHomeCountryRestriction?.iso2,
      allowedPhoneCode: atHomeCountryRestriction?.phoneCode,
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
          allowedCountryName: atHomeCountryRestriction?.name,
          allowedCountryIso2: atHomeCountryRestriction?.iso2,
          onSelect: (value: any) => {
            if (!addressMatchesAtHomeCountry(value, atHomeCountryRestriction)) {
              showAtHomeCountryRestrictionToast();
              return;
            }
            setSelectedAddress(value);
          },
        });
      }
      return;
    }

    openOtherPersonDetailsScreen();
  };

  const navigateToBookingList = useCallback((payload: any) => {
    navigation.navigate(SCREEN_NAMES.HOME, {
      screen: SCREEN_NAMES.BOOKING_LIST,
      params: { bookingData: payload },
    });
  }, [navigation]);

  const navigateToRoutineDetail = useCallback(
    (routineBookingId: string) => {
      navigation.reset({
        index: 1,
        routes: [
          { name: SCREEN_NAMES.HOME },
          {
            name: SCREEN_NAMES.ROUTINE_BOOKING_DETAIL,
            params: { routineBookingId: String(routineBookingId) },
          },
        ],
      });
    },
    [navigation],
  );

  const resolveRoutineBookingId = useCallback(
    (confirmRes: any, fallbackPayload?: any) => {
      const fromConfirm = getRoutineBookingIdFromCreateResponse(confirmRes);
      if (fromConfirm) return fromConfirm;
      const rb = fallbackPayload?.routineBooking ?? confirmRes?.ResponseData?.routineBooking;
      if (typeof rb === 'string' && rb.trim()) return rb.trim();
      if (rb?._id != null) return String(rb._id);
      if (rb?.id != null) return String(rb.id);
      return null;
    },
    [],
  );

  const invalidateCheckoutQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
    queryClient.invalidateQueries({ queryKey: ['customerWallet'] });
  };

  const openCheckoutPaymentSuccessModal = useCallback((confirmRes: any, fallbackPayload: any) => {
    paymentSuccessDataRef.current = { confirmRes, fallbackPayload };
    setPaymentSuccessConfirmRes(confirmRes);
    setShowPaymentSuccessModal(true);
  }, []);

  const handlePaymentSuccessContinue = useCallback(() => {
    const data = paymentSuccessDataRef.current;
    paymentSuccessDataRef.current = null;
    setShowPaymentSuccessModal(false);
    setPaymentSuccessConfirmRes(null);
    invalidateCheckoutQueries();

    const routineBookingId = resolveRoutineBookingId(
      data?.confirmRes,
      data?.fallbackPayload,
    );
    if (routineBookingId || isRoutine) {
      if (routineBookingId) {
        navigateToRoutineDetail(routineBookingId);
      } else {
        navigateToBookingList(data?.fallbackPayload ?? {});
      }
      return;
    }

    const bookingMongoId =
      data?.confirmRes?.ResponseData?.booking?._id ??
      data?.confirmRes?.ResponseData?.booking?.id;
    if (bookingMongoId) {
      navigation.reset({
        index: 1,
        routes: [
          { name: SCREEN_NAMES.HOME },
          {
            name: SCREEN_NAMES.BOOKING_DETAIL,
            params: { bookingId: String(bookingMongoId) },
          },
        ],
      });
    } else if (data?.fallbackPayload) {
      navigateToBookingList(data.fallbackPayload);
    }
  }, [
    navigation,
    isRoutine,
    navigateToRoutineDetail,
    navigateToBookingList,
    resolveRoutineBookingId,
  ]);

  // Handle return from PayPal WebView (success/cancel/failure)
  useFocusEffect(
    useCallback(() => {
      const result = route.params?.paymentResult;
      const payload = route.params?.checkoutPayload;
      const message = route.params?.paymentMessage;
      const confirmRes = route.params?.paymentConfirmResponse;
      if (result === 'success' && payload) {
        invalidateCheckoutQueries();
        if (
          confirmRes?.ResponseData?.booking ||
          confirmRes?.ResponseData?.routineBooking
        ) {
          openCheckoutPaymentSuccessModal(confirmRes, payload);
        } else if (isRoutine) {
          const routineBookingId = resolveRoutineBookingId(confirmRes, payload);
          if (routineBookingId) {
            navigateToRoutineDetail(routineBookingId);
          } else {
            navigateToBookingList(payload);
          }
        } else {
          handleSuccessToast(message || t('checkout.bookingCreatedSuccess'));
          setTimeout(() => navigateToBookingList(payload), 300);
        }
        navigation.setParams({
          paymentResult: undefined,
          checkoutPayload: undefined,
          paymentMessage: undefined,
          paymentConfirmResponse: undefined,
        });
      }
      if (result === 'failure' && route.params?.paymentError) {
        showCheckoutError(route.params.paymentError);
        navigation.setParams({ paymentResult: undefined, paymentError: undefined });
      }
      if (result === 'cancel') {
        // User closed/backed out of gateway: keep data, show no message.
        navigation.setParams({
          paymentResult: undefined,
          paymentError: undefined,
          paymentMessage: undefined,
        });
      }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [route.params?.paymentResult, route.params?.checkoutPayload, route.params?.paymentMessage, route.params?.paymentConfirmResponse, route.params?.paymentError, showCheckoutError, openCheckoutPaymentSuccessModal, isRoutine, navigateToRoutineDetail, resolveRoutineBookingId, t]),
  );

  useEffect(() => {
    if (!isRoutine) return;
    if (paymentMode !== 'cash' && paymentMode !== 'online') {
      setPaymentMode('online');
      setWalletPartialAmount('');
    }
  }, [isRoutine, paymentMode]);

  const runPaymentAfterCreate = async (
    entityId: string,
    paymentAmount: number,
    response: any,
    payload: any,
    selectedPaymentMethod: BookingPaymentMethod,
    walletAmountUsed: number,
    options: { isRoutine: boolean },
  ) => {
    const { isRoutine: routineFlow } = options;
    const gatewayParams = routineFlow
      ? { routineBookingId: entityId }
      : { bookingId: entityId };

    const needsCardGateway = shouldUseGatewayPayment(selectedPaymentMethod) && totalPrice > 0 &&  (paymentMode === 'online' || (paymentMode === 'wallet_partial' && remainingAfterWallet > 0));

    if (needsCardGateway) {
      runGatewayPayment(navigation, {
        ...gatewayParams,
        amount: paymentAmount,
        paymentGateway: selectedPaymentMethod as 'stripe' | 'paypal' | 'flutterwave',
        paymentType: paymentMode,
        paymentMethod: 'card',
        walletAmountUsed,
        returnTo: SCREEN_NAMES.CHECKOUT,
        returnRouteKey: route.key,
        returnParams: { bookingData, checkoutPayload: payload },
        failureMessage: t('checkout.failedToCreateBooking'),
        onSuccess: (confirmRes: any) => {
          if (routineFlow) {
            const hasRoutine = !!confirmRes?.ResponseData?.routineBooking;
            if (hasRoutine) {
              openCheckoutPaymentSuccessModal(confirmRes, {
                ...payload,
                routineBooking: confirmRes.ResponseData.routineBooking,
              });
              return;
            }
            showCheckoutError(
              confirmRes?.ResponseMessage || t('checkout.failedToCreateBooking'),
            );
            return;
          }

          const bookingPayload = confirmRes?.ResponseData?.booking;
          const hasBooking = !!(
            bookingPayload?._id ??
            bookingPayload?.id ??
            confirmRes?.ResponseData?.bookingId
          );
          if (paymentMode === 'wallet_partial' && !hasBooking) {
            showCheckoutError(
              confirmRes?.ResponseMessage ||
                t('checkout.wallet.cardPaymentNotCompleted'),
            );
            return;
          }
          if (hasBooking) {
            openCheckoutPaymentSuccessModal(confirmRes, payload);
            return;
          }
          handleSuccessToast(
            confirmRes?.ResponseMessage ||
              response?.ResponseMessage ||
              t('checkout.bookingCreatedSuccess'),
          );
          invalidateCheckoutQueries();
          setTimeout(() => navigateToBookingList(payload), 800);
        },
        onCancel: () => {},
        onError: (error: any) => {
          showCheckoutError(error);
        },
      });
      return;
    }

    const needsWalletInitiateConfirm =
      paymentMode === 'wallet' ||
      (paymentMode === 'wallet_partial' &&
        selectedPaymentMethod === 'wallet' &&
        remainingAfterWallet <= 0);

    if (needsWalletInitiateConfirm) {
      runGatewayPayment(navigation, {
        ...gatewayParams,
        amount: paymentAmount,
        paymentType: 'wallet',
        paymentMethod: 'wallet',
        walletAmountUsed: 0,
        walletTransactionId: null,
        returnTo: SCREEN_NAMES.CHECKOUT,
        returnRouteKey: route.key,
        returnParams: { bookingData, checkoutPayload: payload },
        failureMessage: t('checkout.failedToCreateBooking'),
        onSuccess: (confirmRes: any) => {
          if (routineFlow) {
            if (confirmRes?.ResponseData?.routineBooking) {
              openCheckoutPaymentSuccessModal(confirmRes, {
                ...payload,
                routineBooking: confirmRes.ResponseData.routineBooking,
              });
              return;
            }
            showCheckoutError(
              confirmRes?.ResponseMessage || t('checkout.failedToCreateBooking'),
            );
            return;
          }

          const bookingPayload = confirmRes?.ResponseData?.booking;
          const hasBooking = !!(
            bookingPayload?._id ??
            bookingPayload?.id ??
            confirmRes?.ResponseData?.bookingId
          );
          if (!hasBooking) {
            showCheckoutError(
              confirmRes?.ResponseMessage || t('checkout.failedToCreateBooking'),
            );
            return;
          }
          openCheckoutPaymentSuccessModal(confirmRes, payload);
        },
        onCancel: () => {},
        onError: (error: any) => {
          showCheckoutError(error);
        },
      });
      return;
    }

    if (
      paymentMode === 'wallet_partial' &&
      remainingAfterWallet > 0 &&
      !shouldUseGatewayPayment(selectedPaymentMethod)
    ) {
      showCheckoutError(t('checkout.wallet.cardPaymentNotCompleted'));
      return;
    }

    if (routineFlow && response?.ResponseData?.routineBooking) {
      invalidateCheckoutQueries();
      openCheckoutPaymentSuccessModal(response, {
        ...payload,
        routineBooking: response.ResponseData.routineBooking,
      });
      return;
    }

    if (response?.ResponseData?.booking) {
      invalidateCheckoutQueries();
      openCheckoutPaymentSuccessModal(response, payload);
      return;
    }
    handleSuccessToast(response?.ResponseMessage || t('checkout.bookingCreatedSuccess'));
    invalidateCheckoutQueries();
    setTimeout(() => navigateToBookingList(payload), 800);
  };

  const handleBookingCreated = async (
    response: any,
    payload: any,
    selectedPaymentMethod: BookingPaymentMethod,
    walletAmountUsed: number,
  ) => {
    if (!response?.succeeded && !response?.ResponseData) {
      showCheckoutError(response?.ResponseMessage, t('checkout.failedToCreateBooking'));
      return;
    }

    const bookingId = getBookingIdFromCreateResponse(response);

    if (!bookingId) {
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      navigateToBookingList(payload);
      return;
    }

    await localStorage.saveItem('bookingId', bookingId as string);

    await runPaymentAfterCreate(
      bookingId,
      totalPrice,
      response,
      payload,
      selectedPaymentMethod,
      walletAmountUsed,
      { isRoutine: false },
    );
  };

  const handleRoutineBookingCreated = async (
    response: any,
    payload: any,
    selectedPaymentMethod: BookingPaymentMethod,
    walletAmountUsed: number,
  ) => {
    if (!response?.succeeded && !response?.ResponseData) {
      showCheckoutError(response?.ResponseMessage, t('checkout.failedToCreateBooking'));
      return;
    }

    const routineBookingId = getRoutineBookingIdFromCreateResponse(response);
    const paymentAmount = getRoutineAmountFromCreateResponse(response, totalPrice);

    if (!routineBookingId) {
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      handleSuccessToast(
        response?.ResponseMessage || t('checkout.bookingCreatedSuccess'),
      );
      navigateToBookingList(payload);
      return;
    }

    await runPaymentAfterCreate(
      routineBookingId,
      paymentAmount,
      response,
      payload,
      selectedPaymentMethod,
      walletAmountUsed,
      { isRoutine: true },
    );
  };

  const submitBooking = async (
    selectedPaymentMethod: BookingPaymentMethod,
    walletAmountUsed: number = 0,
  ) => {
    if (isRoutine) {
      const routinePayload = buildRoutineBookingPayload({
        bookingData,
        selectedServices,
        serviceFor,
        selectedAddress,
        paymentMode,
      });

      createRoutineBooking(routinePayload, {
        onSuccess: async (response: any) => {
          await handleRoutineBookingCreated(
            response,
            routinePayload,
            selectedPaymentMethod,
            walletAmountUsed,
          );
        },
        onError: (error: any) => {
          console.error('Routine booking creation error:', error);
          showCheckoutError(error);
        },
      });
      return;
    }

    const payload = buildBookingPayload({
      bookingData,
      selectedServices,
      serviceFor,
      selectedAddress,
      otherPersonDetails,
      paymentMode,
      walletAmountUsed,
      bookingId: undefined,
    });

    createBooking(payload, {
      onSuccess: async (response: any) => {
        await handleBookingCreated(
          response,
          payload,
          selectedPaymentMethod,
          walletAmountUsed,
        );
      },
      onError: (error: any) => {
        console.error('Booking creation error:', error);
        showCheckoutError(error);
      },
    });
  };

  const handleConfirmBooking = () => {
    if (!isFormValid) {
      if (
        needsAddress &&
        (!selectedAddressCountryValid ||
          !otherAddressCountryValid ||
          !otherPhoneCountryValid)
      ) {
        showAtHomeCountryRestrictionToast();
      }
      return;
    }

    if (isRoutine) {
      if (paymentMode === 'cash') {
        submitBooking('cash', 0);
        return;
      }
      if (paymentMode === 'online') {
        setShowPaymentModal(true);
      }
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

  const handlePaymentMethodConfirm = (
    selectedPaymentMethod: 'paypal' | 'stripe' | 'flutterwave' | 'cash',
  ) => {
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


      <KeyboardFormScroll contentContainerStyle={styles.content}>
        <AppointmentDetailsSection
          bookingData={bookingData}
          totalPrice={totalPrice}
          styles={styles}
          t={t}
        />
        <SelectedServicesSection
          selectedServices={selectedServices}
          showPromotionalOffers={!isRoutine && !bookingData?.promotionsDisabled}
        />
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
          isRoutine={isRoutine}
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
            (!isRoutine &&
              (invalidPartialWalletAmount ||
                insufficientWalletBalance ||
                (paymentMode === 'wallet_partial' && walletPartialNum <= 0)))
          }
          isLoading={isLoading}
        />
      </KeyboardFormScroll>


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

      <SweetAlert
        visible={showPaymentFailedPopup}
        message={paymentFailedMessage || t('checkout.failedToCreateBooking')}
        isConfirmType="delete"
        onOk={() => {
          setShowPaymentFailedPopup(false);
          setPaymentFailedMessage('');
        }}
        onCancel={() => {
          setShowPaymentFailedPopup(false);
          setPaymentFailedMessage('');
        }}
      />

      <BookingPaymentSuccessModal
        visible={showPaymentSuccessModal}
        confirmResponse={paymentSuccessConfirmRes}
        onContinueToBooking={handlePaymentSuccessContinue}
      />
    </Container>
  );
}
