import { View, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeContext } from '@utils/theme';
import { resetAndNavigate } from '@utils/NavigationUtils';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useProfileSplashScreen } from '@services/index';
import { setUserCity } from '@store/slices/appSlice';
import LottieView from 'lottie-react-native';
import imagePaths from '@assets';

export default function SplashScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(), []);

  const [animationFinished, setAnimationFinished] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const { data: userData, isLoading ,error} = useProfileSplashScreen(true, token || '');
  const dispatch = useAppDispatch();
  console.log('error------ 29', error);
  const onAnimationFinish = useCallback(() => {
    setAnimationFinished(true);
  }, []);

  useEffect(() => {
    if (!animationFinished) return;

    if (!isAuthenticated || !token) {
      resetAndNavigate(SCREEN_NAMES.LOGIN);
      return;
    }

    if (isLoading) return;

    if (userData?.succeeded) {
      const hasInterests =
        userData?.ResponseData?.interests &&
        userData.ResponseData.interests.length > 0;
      if (hasInterests) {
        dispatch(setUserCity(userData.ResponseData?.city));
        resetAndNavigate(SCREEN_NAMES.HOME);
      } else {
        resetAndNavigate(SCREEN_NAMES.INTEREST_CHOOSE, { prevScreen: 'auth' });
      }
    } else {
      resetAndNavigate(SCREEN_NAMES.LOGIN);
    }
  }, [animationFinished, isAuthenticated, token, isLoading, userData, dispatch]);

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={theme.colors.gradientColor}
      >
        <LottieView
          source={imagePaths.logo_json}
          autoPlay
          style={{ height: theme.size.SH(130), width: theme.size.SH(130) }}
          loop={false}
          onAnimationFinish={onAnimationFinish}
        />
      </LinearGradient>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    linearGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
