import { useCallback } from 'react';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import {
  useConfirmAdditionalAddonPayment,
  useInitiateAdditionalAddonPayment,
} from '@services/api/queries/appQueries';
import SCREEN_NAMES from '@navigation/ScreenNames';
import {
  getPaymentResponseDetails,
  isSuccessfulPaymentInitiation,
} from './gatewayPayment';
import { Platform } from 'react-native';

export type AdditionalAddonGateway = 'stripe' | 'paypal';

export interface RunAdditionalAddonGatewayParams {
  bookedServiceId: string;
  addonId: string;
  amount: number;
  paymentGateway: AdditionalAddonGateway;
  paymentMethod?: string;
  returnTo?: string;
  returnRouteKey?: string;
  returnParams?: Record<string, any>;
  onSuccess: (initiateRes: any) => void;
  onCancel: (bookedServiceId: string) => void;
  onError: (error: any, bookedServiceId: string) => void;
  handleApiError?: (error: any) => void;
  handleApiFailureResponse?: (response: any, defaultMessage: string) => void;
  failureMessage?: string;
}

/**
 * Stripe / PayPal flow for additional add-on payments (after POST …/additional-addon).
 * Mirrors booking gateway flow; confirm uses /payments/additional-addon/confirm.
 */
export function useAdditionalAddonGatewayPayment() {
  const { mutateAsync: initiatePayment, isPending: isInitiating } =
    useInitiateAdditionalAddonPayment();
  const { mutateAsync: confirmPayment, isPending: isConfirming } =
    useConfirmAdditionalAddonPayment();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const runAdditionalAddonGatewayPayment = useCallback(
    async (navigation: any, params: RunAdditionalAddonGatewayParams) => {
      const {
        bookedServiceId,
        addonId,
        amount,
        paymentGateway,
        paymentMethod = 'card',
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

      const paymentRequest = {
        bookedServiceId,
        addonId,
        amount,
        paymentGateway,
        paymentMethod,
        platform: Platform.OS === 'web' ? 'web' : 'app',
      };

      let initiateRes: any;
      try {
        initiateRes = await initiatePayment(paymentRequest);
      } catch (err) {
        if (handleApiError) handleApiError(err);
        else onError(err, bookedServiceId);
        return;
      }

      if (!isSuccessfulPaymentInitiation(initiateRes)) {
        if (handleApiFailureResponse)
          handleApiFailureResponse(initiateRes, failureMessage);
        else
          onError(
            new Error(initiateRes?.ResponseMessage ?? failureMessage),
            bookedServiceId,
          );
        return;
      }

      const { transactionId, clientSecret, redirectUrl } =
        getPaymentResponseDetails(initiateRes);

      if (paymentGateway === 'stripe') {
        if (!clientSecret) {
          if (handleApiFailureResponse)
            handleApiFailureResponse(
              { ResponseMessage: 'No payment intent' },
              failureMessage,
            );
          else onError(new Error('No payment intent'), bookedServiceId);
          return;
        }
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Squedio',
        });
        if (initError) {
          onError(initError, bookedServiceId);
          return;
        }
        const { error: presentError, didCancel } = await presentPaymentSheet();
        if (didCancel) {
          onCancel(bookedServiceId);
          return;
        }
        if (presentError) {
          onError(presentError, bookedServiceId);
          return;
        }
        try {
          if (transactionId) {
            await confirmPayment({ transactionId });
          }
          onSuccess(initiateRes);
        } catch (err) {
          onError(err, bookedServiceId);
        }
        return;
      }

      if (paymentGateway === 'paypal') {
        if (!redirectUrl) {
          if (handleApiFailureResponse)
            handleApiFailureResponse(
              { ResponseMessage: 'No redirect URL for PayPal' },
              failureMessage,
            );
          else onError(new Error('No redirect URL for PayPal'), bookedServiceId);
          return;
        }
        if (!transactionId) {
          if (handleApiFailureResponse)
            handleApiFailureResponse(
              { ResponseMessage: 'No transaction for PayPal' },
              failureMessage,
            );
          else onError(new Error('No transaction for PayPal'), bookedServiceId);
          return;
        }
        if (!returnTo) {
          onError(new Error('returnTo is required for PayPal'), bookedServiceId);
          return;
        }
        navigation.navigate(SCREEN_NAMES.PAYMENT_WEBVIEW, {
          paymentUrl: redirectUrl,
          /** Do not use `bookingId` here — it is the booking detail route param and gets merged back onto BookingDetail. */
          paypalBookedServiceId: bookedServiceId,
          transactionId,
          initiateRes,
          returnTo,
          returnRouteKey,
          returnParams,
          paymentFlow: 'additional_addon',
        });
      }
    },
    [
      initiatePayment,
      confirmPayment,
      initPaymentSheet,
      presentPaymentSheet,
    ],
  );

  return {
    runAdditionalAddonGatewayPayment,
    isPending: isInitiating || isConfirming,
  };
}
