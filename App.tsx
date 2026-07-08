import { LogBox, View } from 'react-native';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { StorageProvider, ThemeProvider } from '@utils/index';
import { setFormattingLocaleSync } from '@utils/currency';
import { configureCalendarLocale } from '@utils/calendarLocale';
import { mapI18nLanguageToIntlLocale } from './src/utils/langauage/locale';
import i18next from 'i18next';
import './src/utils/langauage/i18n';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { store, persistor } from './src/store';
import { setLanguage } from './src/store/slices/appSlice';
import { queryClient } from './src/services/api/queryClient';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/stripe';
import Toast from 'react-native-toast-message';
import toastConfig from '@components/common/CustomToast';
import { MenuProvider } from 'react-native-popup-menu';
import { SocketProvider } from '@services/socket/SocketProvider';
import {
  notificationListener,
  requestUserPermission,
} from '@services/PushNotification';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { BiometricSetupProvider } from '@contexts/BiometricSetupContext';
import { CurrencyProvider } from '@contexts/CurrencyContext';

LogBox.ignoreLogs([
  'Open debugger to view warnings',
  'findHostInstance_DEPRECATED is deprecated in StrictMode',
  'findNodeHandle is deprecated in StrictMode',
]);

const App = () => {
  useEffect(() => {
    init();
  }, []);
  async function init() {
    const language = await StorageProvider.getItem('language');
    const lang = language || 'en';
    i18next.changeLanguage(lang);
    store.dispatch(setLanguage(lang));
    setFormattingLocaleSync(mapI18nLanguageToIntlLocale(lang));
    configureCalendarLocale(lang);
    await requestUserPermission();
    notificationListener();
  }
  console.log('STRIPE_PUBLISHABLE_KEY------', STRIPE_PUBLISHABLE_KEY);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
              <SocketProvider>
                <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
                  <View style={{ flex: 1 }}>
                    <ApplicationProvider {...eva} theme={eva.light}>
                      <MenuProvider>
                        <ThemeProvider>
                          <BiometricSetupProvider>
                            <CurrencyProvider>
                              <RootNavigator />
                            </CurrencyProvider>
                          </BiometricSetupProvider>
                        </ThemeProvider>
                      </MenuProvider>
                    </ApplicationProvider>
                  </View>
                </KeyboardProvider>
              </SocketProvider>
              <Toast config={toastConfig} />
            </StripeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
