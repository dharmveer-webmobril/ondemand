import { useCallback } from 'react';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import {
  useConfirmBookingPayment,
  useInitiateBookingPayment,
} from '@services/api/queries/appQueries';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  getPaymentResponseDetails,
  isSuccessfulPaymentInitiation,
  type RunGatewayPaymentParams,
} from './gatewayPayment';

/**
 * Common payment hook – use from Checkout, Wallet, BookingDetail.
 * For Stripe: initiate → present sheet → confirm → onSuccess/onCancel/onError.
 * For PayPal: initiate → get payment URL → navigate to PaymentWebView → success/failure handled in WebView.
 *
 * Usage from any screen (e.g. BookingDetail "Pay now", Wallet top-up):
 *   const { runGatewayPayment, isPending } = useGatewayPayment();
 *   runGatewayPayment(navigation, {
 *     bookingId, amount, paymentGateway: 'stripe' | 'paypal', walletAmountUsed,
 *     returnTo: SCREEN_NAMES.BOOKING_DETAIL,  // required for PayPal
 *     returnParams: { bookingId },
 *     onSuccess: (res) => { ... },
 *     onCancel: (id) => { ... },
 *     onError: (err, id) => { ... },
 *     handleApiError, handleApiFailureResponse, failureMessage,
 *   });
 * When returning from PayPal WebView, handle route.params.paymentResult ('success'|'cancel'|'failure').
 */
export function useGatewayPayment() {
  const { mutateAsync: initiatePayment, isPending: isInitiatingPayment } =
    useInitiateBookingPayment();
  const { mutateAsync: confirmPayment, isPending: isConfirmingPayment } =
    useConfirmBookingPayment();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const runGatewayPayment = useCallback(
    async (navigation: any, params: RunGatewayPaymentParams) => {
      const {
        bookingId,
        amount,
        paymentGateway,
        walletAmountUsed = 0,
        paymentMethod = 'card',
        walletTransactionId,
        returnTo,
        returnParams = {},
        onSuccess,
        onCancel,
        onError,
        handleApiError,
        handleApiFailureResponse,
        failureMessage = 'Payment initiation failed',
      } = params;

      const paymentRequest = {
        bookingId,
        amount,
        paymentGateway,
        paymentMethod,
        useWallet: walletAmountUsed > 0,
        walletAmount: walletAmountUsed,
      };
      console.log('paymentRequest------ 64', paymentRequest);
      let initiateRes: any;
      try {
        initiateRes = await initiatePayment(paymentRequest);
        console.log('initiateRes------ 68', initiateRes);
      } catch (err) {
        if (handleApiError) handleApiError(err);
        else onError(err, bookingId);
        return;
      }

      if (!isSuccessfulPaymentInitiation(initiateRes)) {
        if (handleApiFailureResponse)
          handleApiFailureResponse(initiateRes, failureMessage);
        else
          onError(
            new Error(initiateRes?.ResponseMessage ?? failureMessage),
            bookingId,
          );
        return;
      }

      const { transactionId, clientSecret, redirectUrl } = getPaymentResponseDetails(initiateRes);
      console.log('transactionId------ 82', transactionId);
      console.log('clientSecret------ 83', clientSecret);
      console.log('redirectUrl------ 84', redirectUrl);

      if (paymentGateway === 'stripe') {
        if (!clientSecret) {
          console.log('No payment intent------ 83');
          if (handleApiFailureResponse)
            handleApiFailureResponse(
              { ResponseMessage: 'No payment intent' },
              failureMessage,
            );
          else onError(new Error('No payment intent'), bookingId);
          return;
        }
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Squedio',
        });
        if (initError) {
          console.log('initError------ 92', initError);
          onError(initError, bookingId);
          // if (handleApiError) handleApiError(initError);
          // else onError(initError, bookingId);
          return;
        }
        const { error: presentError, didCancel } = await presentPaymentSheet();
        if (didCancel) {
          console.log('didCancel------ 100', didCancel);
          onCancel(bookingId);
          return;
        }
        if (presentError) {
          console.log('presentError------ 103', presentError);
          // if (handleApiError) handleApiError(presentError);
          // else onError(presentError, bookingId);
          onError(presentError, bookingId);
          return;
        }
        try {
          if (transactionId) {
            const confirmPayload = walletTransactionId
              ? { transactionId, walletTransactionId }
              : { transactionId, bookingId };
            await confirmPayment(confirmPayload);
          }
          onSuccess(initiateRes);
        } catch (err) {
          console.log('err------ 111', err);
          // if (handleApiError) handleApiError(err);
          // else onError(err, bookingId);
          onError(err, bookingId);
        }
        return;
      }

      // PayPal: open WebView screen with payment URL; WebView handles success/failure URLs
      if (paymentGateway === 'paypal') {
        if (!redirectUrl) {
          if (handleApiFailureResponse)
            handleApiFailureResponse(
              { ResponseMessage: 'No redirect URL for PayPal' },
              failureMessage,
            );
          else onError(new Error('No redirect URL for PayPal'), bookingId);
          return;
        }
        if (!transactionId) {
          if (handleApiFailureResponse)
            handleApiFailureResponse(
              { ResponseMessage: 'No transaction for PayPal' },
              failureMessage,
            );
          else onError(new Error('No transaction for PayPal'), bookingId);
          return;
        }
        if (!returnTo) {
          onError(new Error('returnTo is required for PayPal'), bookingId);
          return;
        }
        navigation.navigate(SCREEN_NAMES.PAYMENT_WEBVIEW, {
          paymentUrl: redirectUrl,
          bookingId,
          transactionId,
          walletTransactionId: walletTransactionId ?? undefined,
          initiateRes,
          returnTo,
          returnParams,
        });
      }
    },
    [initiatePayment, confirmPayment, initPaymentSheet, presentPaymentSheet],
  );

  return {
    runGatewayPayment,
    isPending: isInitiatingPayment || isConfirmingPayment,
  };
}
