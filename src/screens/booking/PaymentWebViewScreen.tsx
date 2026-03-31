import React, { useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useConfirmBookingPayment } from '@services/api/queries/appQueries';
import { handleApiError } from '@utils/apiHelpers';
import {
  isPayPalSuccessUrl,
  isPayPalFailureUrl,
  PAYPAL_SUCCESS_URL_PATTERNS,
  PAYPAL_FAILURE_URL_PATTERNS,
} from '@services/payment/gatewayPayment';
import { AppHeader, Container } from '@components/common';
import { useThemeContext } from '@utils/theme';
import { goBack } from '@utils/NavigationUtils';

type RouteParams = {
  paymentUrl: string;
  bookingId: string;
  transactionId: string;
  walletTransactionId?: string | null;
  initiateRes: any;
  returnTo: string;
  returnParams: Record<string, any>;
};

export default function PaymentWebViewScreen() {
  const theme = useThemeContext();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { mutateAsync: confirmPayment, isPending: isConfirming } =
    useConfirmBookingPayment();
  const handledRef = useRef(false);

  const {
    paymentUrl,
    bookingId,
    transactionId,
    walletTransactionId,
    initiateRes,
    returnTo,
    returnParams = {},
  } = (route.params || {}) as RouteParams;

  const handleNavigationStateChange = useCallback(
    async (navState: { url?: string }) => {
      const url = navState?.url || '';
      if (!url || handledRef.current) return;
      console.log('url------ 47', url);
      console.log('isPayPalSuccessUrl------ 48', isPayPalSuccessUrl(url, PAYPAL_SUCCESS_URL_PATTERNS));
      console.log('isPayPalFailureUrl------ 49', isPayPalFailureUrl(url, PAYPAL_FAILURE_URL_PATTERNS));
      if (isPayPalSuccessUrl(url, PAYPAL_SUCCESS_URL_PATTERNS)) {
        handledRef.current = true;
        try {
          const confirmPayload = walletTransactionId ? { transactionId, walletTransactionId }: { transactionId, bookingId };

          await confirmPayment(confirmPayload);

          navigation.navigate(returnTo, {
            ...returnParams,
            paymentResult: 'success',
            paymentMessage: initiateRes?.ResponseMessage,
            bookingId,
          });
        } catch (error) {
          handleApiError(error);
          console.log('payment webview error------ 71', error);
          goBack();
          // navigation.navigate(returnTo, {
          //   ...returnParams,
          //   paymentResult: 'failure',
          //   paymentError: (error as Error)?.message,
          //   bookingId,
          // });
        }
        return;
      }

      if (isPayPalFailureUrl(url, PAYPAL_FAILURE_URL_PATTERNS)) {
        handledRef.current = true;
        // Treat this as a real payment failure – inform the return screen.
        navigation.navigate(returnTo, {
          ...returnParams,
          paymentResult: 'failure',
          paymentError: 'Payment failed',
          bookingId,
        });
        console.log('payment webview failure------ 92');
      }
    },
    [
      bookingId,
      transactionId,
      walletTransactionId,
      returnTo,
      returnParams,
      initiateRes,
      confirmPayment,
      navigation,
    ],
  );

  const handleClose = useCallback(() => {
    // User explicitly closed the sheet: treat as cancel without error message.
    goBack();
    console.log('payment webview close------ 114');
  }, []);

  if (!paymentUrl) {
    return null;
  }

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title="Pay with PayPal"
        onLeftPress={handleClose}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
      />
      <View style={styles.webviewWrap}>
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          style={styles.webview}
        />
      </View>
      {isConfirming && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewWrap: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
