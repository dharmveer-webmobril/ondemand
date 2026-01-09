import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showToast } from '@components';

const EXIT_DELAY = 1200;

const useDisableGestures = (enabled: boolean = true) => {
  const navigation = useNavigation<any>();
  const lastBackPress = useRef<number>(0);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      // 🔒 Disable gestures when screen is focused
      navigation.setOptions({
        headerLeft: () => null,
        gestureEnabled: false,
      });

      navigation.getParent()?.setOptions({
        gestureEnabled: false,
      });

      // 🔙 Android back handler
      const onBackPress = () => {
        if (Platform.OS !== 'android') return false;

        const now = Date.now();

        if (now - lastBackPress.current < EXIT_DELAY) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPress.current = now;

        showToast({
          type: 'exit',
          message: t('messages.doubletab'), // "Press back again to exit"
          timeout: 1550,
          position: 'bottom'
        });

        return true; // ⛔ block default navigation
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // 🧹 Cleanup when screen BLURS / UNMOUNTS
      return () => {
        navigation.getParent()?.setOptions({
          gestureEnabled: true,
        });

        navigation.setOptions({
          gestureEnabled: true,
        });

        backHandler.remove();
        lastBackPress.current = 0;
      };
    }, [navigation, enabled]),
  );
};

export default useDisableGestures;
