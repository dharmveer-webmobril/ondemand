import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import Toast from 'react-native-toast-message';
import { showAppToast } from '../../component';
const useDisableGestures = () => {
  const navigation = useNavigation();
  const lastBackPress = useRef<number>(0); // Store the last back press timestamp

  useFocusEffect(
    useCallback(() => {
      // Disable gestures
      navigation.setOptions({
        headerLeft: () => null,
        gestureEnabled: false,
      });

      navigation.getParent()?.setOptions({ gestureEnabled: false });

      // Handle Android back button for double press exit
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          const now = Date.now();
          if (lastBackPress.current && now - lastBackPress.current < 1200) {
            BackHandler.exitApp();
            return true;
          }

          lastBackPress.current = now;
          // ToastAndroid.show('Double press to exit', ToastAndroid.SHORT);
          showAppToast({
            title: 'Double press to exit',
            message: '',
            type: 'exit',
            position:'bottom',
            timeout: 1500,
          });
          return true; // Prevent default back behavior
        },
      );

      return () => {
        // Re-enable gestures when leaving screen
        navigation.getParent()?.setOptions({ gestureEnabled: true });
        navigation.setOptions({ gestureEnabled: true });

        // Remove back handler
        backHandler.remove();
      };
    }, [navigation]),
  );
};

export default useDisableGestures;
