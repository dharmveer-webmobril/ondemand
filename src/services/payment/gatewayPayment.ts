import type { InitiateBookingPaymentRequest } from '@services/api/queries/appQueries';

export type GatewayPaymentMethod = 'stripe' | 'paypal' | 'flutterwave';

/** Flutterwave web checkout (redirect URL → PaymentWebViewScreen). */
export const FLUTTERWAVE_PAYMENT_ENABLED = true;

/** PayPal and Flutterwave: server returns `redirectUrl` and the app completes payment in `PaymentWebViewScreen`. */
export function isWebRedirectGateway(
  g: GatewayPaymentMethod | string | undefined | null,
): boolean {
  return g === 'paypal' || g === 'flutterwave';
}

export interface PaymentResponseDetails {
  transactionId: string | null;
  clientSecret: string | null;
  redirectUrl: string | null;
}

/** Parse initiate payment API response for transactionId, clientSecret (Stripe), redirectUrl (web checkout) */
export function getPaymentResponseDetails(response: any): PaymentResponseDetails {
  const rd = response?.ResponseData;
  const transactionId =
    rd?.gatewayTransaction?.transactionId ??
    rd?.transactionId ??
    rd?.transaction?.transactionId ??
    null;
  const clientSecret =
    rd?.paymentIntent?.client_secret ??
    rd?.gatewayTransaction?.gatewayResponse?.client_secret ??
    null;
  const redirectUrl =
    rd?.redirectUrl ?? rd?.gatewayTransaction?.redirectUrl ?? null;
  return { transactionId, clientSecret, redirectUrl };
}

/** Wallet leg id for `wallet_partial` — returned on initiate (not always on create booking). */
export function getWalletTransactionIdFromInitiate(response: any): string | null {
  const rd = response?.ResponseData;
  if (!rd) {
    return null;
  }
  const top = rd.walletTransactionId;
  if (top != null && String(top).trim() !== '') {
    return String(top).trim();
  }
  const wt = rd.walletTransaction?.transactionId;
  if (wt != null && String(wt).trim() !== '') {
    return String(wt).trim();
  }
  return null;
}

export function isSuccessfulPaymentInitiation(response: any): boolean {
  const rd = response?.ResponseData;
  const hasPaymentData =
    !!rd?.paymentIntent ||
    !!rd?.transaction ||
    !!rd?.gatewayTransaction ||
    !!rd?.walletTransaction ||
    (rd?.transactionId != null && String(rd.transactionId).trim() !== '');
  return (response?.succeeded || response?.ResponseCode === 200) && hasPaymentData;
}

/** Params for the common runGatewayPayment (used from Checkout, Wallet, BookingDetail) */
export interface RunGatewayPaymentParams {
  bookingId?: string;
  tempBookingId?: string;
  routineBookingId?: string;
  amount: number;
  /** Omit for post–create wallet-only initiate (no Stripe / web checkout). */
  paymentGateway?: GatewayPaymentMethod;
  /** Booking payment mode from checkout (required for `wallet_partial` initiate/confirm chain). */
  paymentType?: string;
  walletAmountUsed?: number;
  paymentMethod?: string;
  /** Optional legacy: wallet leg id from create booking; if omitted, `wallet_partial` reads it from initiate response. */
  walletTransactionId?: string | null;
  /** Required for PayPal / Flutterwave WebView: where to go after checkout and params to pass back */
  returnTo?: string;
  returnRouteKey?: string;
  returnParams?: Record<string, any>;
  /** Full confirm-payment API response (includes transaction + booking when succeeded). */
  onSuccess: (confirmResponse: any) => void;
  onCancel: (bookingId?: string) => void;
  onError: (error: any, bookingId?: string) => void;
  handleApiError?: (error: any) => void;
  handleApiFailureResponse?: (response: any, defaultMessage: string) => void;
  failureMessage?: string;
}

/** Params passed to PaymentWebView screen for PayPal / Flutterwave (payment URL + context for success/failure) */
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
