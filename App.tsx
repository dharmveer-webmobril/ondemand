import React, { useEffect } from 'react';

import { LogBox, StyleSheet, View, } from 'react-native';
import AppRoute from './src/navigation/AppRoute';
import './src/utils/langauage/i18n';
import { ChatProvider } from './src/screens/ChatProvider';
import { Provider } from 'react-redux';
import { persistor, store } from './src/redux';
import { notificationListener, requestUserPermission, StorageProvider } from './src/utils';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { MenuProvider } from 'react-native-popup-menu';
import i18next from 'i18next';
import FastImage from 'react-native-fast-image';
import Geocoder from "react-native-geocoding";

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested', // 👈 hides the warning
]);
Geocoder.init("AIzaSyALC5b7touq90VVqX9U96jVMPHjJ5_We8s"); // replace with your key
const App = () => {
// console.log(process.env.GOOGLE_MAP_KEY,'process.env.GOOGLE_MAP_KEY');

  useEffect(() => {
    init()
    requestUserPermission();
    notificationListener();
  }, []);
  useEffect(() => {
    FastImage.clearMemoryCache();
    FastImage.clearDiskCache();
  }, []);

  async function init() {
    let language = await StorageProvider.getItem('language');
    i18next.changeLanguage(language || 'en')
  }
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ChatProvider>
            <MenuProvider>
              <View style={styles.safeArea}>
                <AppRoute />
              </View>
            </MenuProvider>
          </ChatProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default App;
