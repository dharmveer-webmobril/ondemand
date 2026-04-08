import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useConfirmBookingPayment } from '@services/api/queries/appQueries';
import {
  isPayPalFailureUrl,
  isPayPalSuccessUrl,
  PAYPAL_FAILURE_URL_PATTERNS,
  PAYPAL_SUCCESS_URL_PATTERNS,
} from '@services/payment/gatewayPayment';
import { AppHeader, Container } from '@components/common';
import { useThemeContext } from '@utils/theme';

type RouteParams = {
  paymentUrl: string;
  bookingId: string;
  transactionId: string;
  walletTransactionId?: string | null;
  initiateRes: any;
  returnTo: string;
  returnRouteKey?: string;
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
    returnRouteKey,
    returnParams = {},
  } = (route.params || {}) as RouteParams;

  const closeWithResult = useCallback(
    (
      paymentResult: 'success' | 'failure' | 'cancel',
      extraParams: Record<string, any> = {},
    ) => {
      if (handledRef.current) {
        return;
      }

      handledRef.current = true;

      const resultParams = {
        ...returnParams,
        ...extraParams,
        paymentResult,
        bookingId,
      };

      if (returnRouteKey) {
        navigation.dispatch({
          ...CommonActions.setParams(resultParams),
          source: returnRouteKey,
        });

        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
      }

      navigation.dispatch(
        CommonActions.navigate({
          name: returnTo,
          params: resultParams,
          merge: true,
        }),
      );
    },
    [bookingId, navigation, returnParams, returnRouteKey, returnTo],
  );

  const handleNavigationStateChange = useCallback(
    async (navState: { url?: string }) => {
      const url = navState?.url || '';

      if (!url || handledRef.current) {
        return;
      }

      console.log('url------ 47', url);
      console.log(
        'isPayPalSuccessUrl------ 48',
        isPayPalSuccessUrl(url, PAYPAL_SUCCESS_URL_PATTERNS),
      );
      console.log(
        'isPayPalFailureUrl------ 49',
        isPayPalFailureUrl(url, PAYPAL_FAILURE_URL_PATTERNS),
      );

      if (isPayPalSuccessUrl(url, PAYPAL_SUCCESS_URL_PATTERNS)) {
        try {
          const confirmPayload = walletTransactionId
            ? { transactionId, walletTransactionId }
            : { transactionId, bookingId };

          await confirmPayment(confirmPayload);

          closeWithResult('success', {
            paymentMessage: initiateRes?.ResponseMessage,
          });
        } catch (error) {
          console.log('payment webview error------ 71', error);
          closeWithResult('failure', {
            paymentError:
              (error as any)?.response?.data?.ResponseMessage ??
              (error as any)?.response?.data?.message ??
              (error as any)?.message ??
              'Payment confirmation failed',
          });
        }
        return;
      }

      if (isPayPalFailureUrl(url, PAYPAL_FAILURE_URL_PATTERNS)) {
        closeWithResult('failure', { paymentError: 'Payment failed' });
        console.log('payment webview failure------ 92');
      }
    },
    [
      bookingId,
      closeWithResult,
      confirmPayment,
      initiateRes,
      transactionId,
      walletTransactionId,
    ],
  );

  const handleClose = useCallback(() => {
    closeWithResult('cancel');
    console.log('payment webview close------ 114');
  }, [closeWithResult]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (handledRef.current) {
        return;
      }

      event.preventDefault();
      closeWithResult('cancel');
    });

    return unsubscribe;
  }, [closeWithResult, navigation]);

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
        containerStyle={{ paddingLeft: 20, paddingRight: 20 }}
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
