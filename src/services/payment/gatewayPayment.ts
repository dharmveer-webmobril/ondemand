import type { InitiateBookingPaymentRequest } from '@services/api/queries/appQueries';

export type GatewayPaymentMethod = 'stripe' | 'paypal';

export interface PaymentResponseDetails {
  transactionId: string | null;
  clientSecret: string | null;
  redirectUrl: string | null;
}

/** Parse initiate payment API response for transactionId, clientSecret (Stripe), redirectUrl (PayPal) */
export function getPaymentResponseDetails(response: any): PaymentResponseDetails {
  const transactionId =
    response?.ResponseData?.transaction?.transactionId ??
    response?.ResponseData?.transactionId ??
    response?.ResponseData?.gatewayTransaction?.transactionId ??
    null;
  const clientSecret =
    response?.ResponseData?.paymentIntent?.client_secret ??
    response?.ResponseData?.gatewayTransaction?.gatewayResponse?.client_secret ??
    null;
  const redirectUrl =
    response?.ResponseData?.redirectUrl ??
    response?.ResponseData?.gatewayTransaction?.redirectUrl ??
    null;
  return { transactionId, clientSecret, redirectUrl };
}

export function isSuccessfulPaymentInitiation(response: any): boolean {
  const hasPaymentData =
    !!response?.ResponseData?.paymentIntent ||
    !!response?.ResponseData?.transaction ||
    !!response?.ResponseData?.gatewayTransaction;
  return (response?.succeeded || response?.ResponseCode === 200) && hasPaymentData;
}

/** Params for the common runGatewayPayment (used from Checkout, Wallet, BookingDetail) */
export interface RunGatewayPaymentParams {
  bookingId: string;
  amount: number;
  paymentGateway: GatewayPaymentMethod;
  walletAmountUsed?: number;
  paymentMethod?: string;
  /** When wallet_partial: send this in confirm instead of bookingId (for both Stripe and PayPal) */
  walletTransactionId?: string | null;
  /** Required for PayPal: where to go after WebView and params to pass back (e.g. { bookingData }) */
  returnTo?: string;
  returnRouteKey?: string;
  returnParams?: Record<string, any>;
  onSuccess: (initiateRes: any) => void;
  onCancel: (bookingId: string) => void;
  onError: (error: any, bookingId: string) => void;
  handleApiError?: (error: any) => void;
  handleApiFailureResponse?: (response: any, defaultMessage: string) => void;
  failureMessage?: string;
}

/** Params passed to PaymentWebView screen for PayPal (payment URL + context for success/failure) */
export interface PaymentWebViewParams {
  paymentUrl: string;
  bookingId: string;
  transactionId: string;
  /** When wallet_partial: send this in confirm instead of bookingId */
  walletTransactionId?: string | null;
  initiateRes: any;
  returnTo: string;
  returnRouteKey?: string;
  returnParams: Record<string, any>;
}

/** URL patterns to detect success/cancel in PayPal WebView (PAYMENT_SUCCESS_URL / PAYMENT_CANCEL_URL from backend) */
export const PAYPAL_SUCCESS_URL_PATTERNS = ['frontend/payment/success', 'payment/success', 'status=success'];
export const PAYPAL_FAILURE_URL_PATTERNS = ['frontend/payment/cancel', 'payment/cancel', 'payment/failure', 'failure', 'status=failure', 'status=cancel'];

function isPayPalSuccessUrl(url: string, patterns: string[] = PAYPAL_SUCCESS_URL_PATTERNS): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return patterns.some((p) => lower.includes(p.toLowerCase()));
}

function isPayPalFailureUrl(url: string, patterns: string[] = PAYPAL_FAILURE_URL_PATTERNS): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return patterns.some((p) => lower.includes(p.toLowerCase()));
}

export { isPayPalSuccessUrl, isPayPalFailureUrl };
