import React, { useEffect } from 'react';

import { I18nManager, StyleSheet, Text, View, TextInput } from 'react-native';
import AppRoute from './src/navigation/AppRoute';
import './src/utils/langauage/i18n';
import { ChatProvider } from './src/screens/ChatProvider';
import { Provider } from 'react-redux';
import { persistor, store } from './src/redux';
import { notificationListener, requestUserPermission, StorageProvider } from './src/utils';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';

import i18next from 'i18next';
const App = () => {

  useEffect(() => {
    init()
    requestUserPermission();
    notificationListener();
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
            <View style={styles.safeArea}>
              <AppRoute />
            </View>
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
