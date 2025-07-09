import React from 'react';
import { NavigatinScreens } from './NavigatinScreens';
import { View } from 'react-native';
import { NoInternet, ToastService } from '../component';
import FlashMessage from 'react-native-flash-message';
import Toast from 'react-native-toast-message';
const AppRoute = () => {
  return (
    <View style={{ flex: 1 }}>
      <NavigatinScreens />
      <ToastService />
      <NoInternet />
    </View>
  );
};

export default AppRoute;
