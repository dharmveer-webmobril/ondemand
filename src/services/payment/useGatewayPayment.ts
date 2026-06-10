import { useCallback } from 'react';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import {
  useConfirmBookingPayment,
  useInitiateBookingPayment,
  type InitiateBookingPaymentRequest,
} from '@services/api/queries/appQueries';
import SCREEN_NAMES from '@navigation/ScreenNames';
import type { RunGatewayPaymentParams } from './gatewayPayment';
import * as GatewayPayment from './gatewayPayment';

/**
 * Booking / checkout payment: initiate → (Stripe sheet | PayPal / Flutterwave WebView | wallet-only) → confirm.
 * - Card (online / wallet_partial remainder): initiate with gateway → sheet/WebView → confirm.
 * - Full wallet after create: initiate without gateway, paymentMethod `wallet` → confirm with transactionId only.
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
        tempBookingId,
        routineBookingId,
        amount,
        paymentGateway,
        paymentType,
        walletAmountUsed = 0,
        paymentMethod = 'card',
        walletTransactionId,
        returnTo,
        returnRouteKey,
        returnParams = {},
        onSuccess,
        onCancel,
        onError,
        handleApiError,
        handleApiFailureResponse,
        failureMessage = 'Payment initiation failed',
      } = params;

      const paymentEntityId = routineBookingId ?? tempBookingId ?? bookingId;
      if (!paymentEntityId) {
        onError(new Error('Missing booking id for payment'), paymentEntityId);
        return;
      }

      const paymentRequest: InitiateBookingPaymentRequest = {
        ...(routineBookingId
          ? { routineBookingId }
          : tempBookingId
            ? { tempBookingId }
            : { bookingId: bookingId! }),
        amount,
        ...(paymentType != null && String(paymentType) !== ''
          ? { paymentType: String(paymentType) }
          : {}),
        paymentMethod,
        platform: 'app',
        useWallet:
          paymentType === 'wallet_partial' ||
          paymentType === 'wallet' ||
          walletAmountUsed > 0,
      };

      if (paymentGateway != null) {
        paymentRequest.paymentGateway = paymentGateway;
      }

      if (paymentType === 'wallet_partial' && walletAmountUsed > 0) {
        paymentRequest.walletAmount = walletAmountUsed;
      }

// console.log('paymentRequest------ 66 ---->', paymentRequest);
      let initiateRes: any;
      try {
        initiateRes = await initiatePayment(paymentRequest);
      } catch (err) {
        if (handleApiError) {
          handleApiError(err);
        } else {
          onError(err, paymentEntityId);
        }
        return;
      }
// console.log('initiateRes------ 78 ---->', initiateRes);
// console.log('initiateRes------ 78 ---->', initiateRes);
// console.log('initiateRes------ 78 ---->', initiateRes);
      if (!GatewayPayment.isSuccessfulPaymentInitiation(initiateRes)) {
        if (handleApiFailureResponse) {
          handleApiFailureResponse(initiateRes, failureMessage);
        } else {
          onError(
            new Error(initiateRes?.ResponseMessage ?? failureMessage),
            paymentEntityId,
          );
        }
        return;
      }

      const { transactionId, clientSecret, redirectUrl } =
        GatewayPayment.getPaymentResponseDetails(initiateRes);

      const walletTxFromInitiate =
        paymentType === 'wallet_partial'
          ? GatewayPayment.getWalletTransactionIdFromInitiate(initiateRes)
          : null;
      const effectiveWalletTransactionId =
        walletTransactionId != null && String(walletTransactionId).trim() !== ''
          ? String(walletTransactionId).trim()
          : walletTxFromInitiate;

      const confirmWithIds = async (txId: string) => {
        const w = effectiveWalletTransactionId;
        const payload =
          w != null && String(w).trim() !== ''
            ? { transactionId: txId, walletTransactionId: w }
            : { transactionId: txId };
        return confirmPayment(payload);
      };

      if (GatewayPayment.isWebRedirectGateway(paymentGateway) && redirectUrl) {
        if (paymentType === 'wallet_partial' && !effectiveWalletTransactionId) {
          onError(
            new Error(
              'Missing wallet transaction id from payment initiation — cannot confirm partial wallet payment.',
            ),
            paymentEntityId,
          );
          return;
        }
        if (!transactionId) {
          if (handleApiFailureResponse) {
            handleApiFailureResponse(
              { ResponseMessage: 'No transaction for web checkout' },
              failureMessage,
            );
          } else {
            onError(new Error('No transaction for web checkout'), paymentEntityId);
          }
          return;
        }
        if (!returnTo) {
          onError(new Error('returnTo is required for web checkout'), paymentEntityId);
          return;
        }
        navigation.navigate(SCREEN_NAMES.PAYMENT_WEBVIEW, {
          paymentUrl: redirectUrl,
          bookingId: paymentEntityId,
          transactionId,
          walletTransactionId: effectiveWalletTransactionId ?? undefined,
          initiateRes,
          returnTo,
          returnRouteKey,
          returnParams,
          webCheckoutGateway: paymentGateway,
        });
        return;
      }

      if (paymentGateway === 'stripe' && clientSecret) {
        if (paymentType === 'wallet_partial' && !effectiveWalletTransactionId) {
          onError(
            new Error(
              'Missing wallet transaction id from payment initiation — cannot confirm partial wallet payment.',
            ),
            paymentEntityId,
          );
          return;
        }
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Squedio',
        });
        if (initError) {
          onError(initError, paymentEntityId);
          return;
        }
        const { error: presentError, didCancel } = await presentPaymentSheet();
        if (didCancel) {
          onCancel(paymentEntityId);
          return;
        }
        if (presentError) {
          onError(presentError, paymentEntityId);
          return;
        }
        if (!transactionId) {
          onError(
            new Error(
              'Missing gateway transaction id after payment — cannot confirm booking payment.',
            ),
            paymentEntityId,
          );
          return;
        }
        try {
          const confirmRes = await confirmWithIds(transactionId);
          onSuccess(confirmRes);
        } catch (err) {
          onError(err, paymentEntityId);
        }
        return;
      }

      // Pure wallet (or server returns only transactionId — no card / redirect).
      if (paymentMethod === 'wallet' && transactionId) {
        try {
          const confirmRes = await confirmWithIds(transactionId);
          onSuccess(confirmRes);
        } catch (err) {
          onError(err, paymentEntityId);
        }
        return;
      }

      if (handleApiFailureResponse) {
        handleApiFailureResponse(
          { ResponseMessage: 'Unsupported payment response from server' },
          failureMessage,
        );
      } else {
        onError(
          new Error(
            initiateRes?.ResponseMessage ??
              'Unsupported payment response from server',
          ),
          paymentEntityId,
        );
      }
    },
    [initiatePayment, confirmPayment, initPaymentSheet, presentPaymentSheet],
  );

  return {
    runGatewayPayment,
    isPending: isInitiatingPayment || isConfirmingPayment,
  };
}
