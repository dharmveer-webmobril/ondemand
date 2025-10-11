import React, { useEffect } from 'react';
import { NavigatinScreens } from './NavigatinScreens';
import { View, StyleSheet, Linking } from 'react-native';
import { NoInternet, SweetaelertModal, ToastService } from '../component';
import ToastManager from 'toastify-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setInactiveMessage, setUserActiveOrNotModal } from '../redux';
import RouteName from './RouteName';
import { navigate } from '../utils';

const AppRoute = () => {
  const insets = useSafeAreaInsets();
  console.log('insets.top', insets.top);
  const { isUserActiveOrNotModal, inactiveMessage } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();

  useEffect(() => {
    // const handleDeepLink = (event: { url: string }) => {
    //   const url = event.url;
    //   console.log('Received deep link:', url);
    //   if (url) {
    //     const route = url.replace(/.*?:\/\//g, '');
    //     const [path, id] = route.split('/');
    //     console.log('route, path, id', route, path, id);
    //     if (path === 'profile' && id) {
    //       navigate('Profile', { providerId: id });
    //     }
    //   }
    // };
    // const subscription = Linking.addEventListener('url', handleDeepLink);
    // return () => {
    //   subscription.remove();
    // };
  }, []);

  return (
    <View style={styles.container}>
      <NavigatinScreens />
      <ToastService />
      <NoInternet />
      <ToastManager style={[styles.toastManager, { top: insets.top || 0 }]} />
      <SweetaelertModal
        visible={isUserActiveOrNotModal}
        message={inactiveMessage}
        isConfirmType='info'
        onCancel={() => { }}
        onOk={() => {
          dispatch(setUserActiveOrNotModal({ status: false }));
          dispatch(setInactiveMessage({ message: '' }));
          navigate(RouteName.LOGIN as never)
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastManager: {
    position: 'absolute',
  },
});

export default AppRoute;
