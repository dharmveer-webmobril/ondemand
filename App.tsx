import { LogBox, View } from 'react-native'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StripeProvider } from '@stripe/stripe-react-native'
import RootNavigator from './src/navigation/RootNavigator'
import { StorageProvider, ThemeProvider } from '@utils/index';
import i18next from 'i18next';
import './src/utils/langauage/i18n';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { store, persistor } from './src/store';
import { queryClient } from './src/services/api/queryClient';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/stripe';
import Toast from 'react-native-toast-message';
import toastConfig from '@components/common/CustomToast'
import { MenuProvider } from 'react-native-popup-menu'
import { SocketProvider } from '@services/socket/SocketProvider'
import { notificationListener, requestUserPermission } from '@services/PushNotification'

LogBox.ignoreLogs([
  'Open debugger to view warnings',
  'findHostInstance_DEPRECATED is deprecated in StrictMode',
  'findNodeHandle is deprecated in StrictMode',
]);

const App = () => {

  useEffect(() => {
    init()
  }, [])
  async function init() {
    let language = await StorageProvider.getItem('language');
    i18next.changeLanguage(language || 'en');
    await requestUserPermission();
    notificationListener();
  }
  console.log('STRIPE_PUBLISHABLE_KEY------', STRIPE_PUBLISHABLE_KEY);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <SocketProvider>
              <View style={{ flex: 1 }}>
                <ApplicationProvider {...eva} theme={eva.light}>
                  <MenuProvider>
                    <ThemeProvider>
                      <RootNavigator />
                    </ThemeProvider>
                  </MenuProvider>
                </ApplicationProvider>
              </View>
            </SocketProvider>
            <Toast config={toastConfig} />
          </StripeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
