import { View, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeContext } from '@utils/theme';
import { resetAndNavigate } from '@utils/NavigationUtils';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useProfileSplashScreen } from '@services/index';
import { store } from '@store/index';
import { queryClient } from '@services/api';
import { ensureCurrentLocationHydrated } from '@utils/address';
import { setUserCity } from '@store/slices/appSlice';
import SplashAnimation from '@components/splash/SplashAnimation';
import { tryOpenPendingProviderProfile } from '@utils/providerProfileDeepLink';
import { isGuestUser } from '@utils/guest/guestAuth';

const SPLASH_MAX_WAIT_MS = 4500;

export default function SplashScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(), []);

  const [animationFinished, setAnimationFinished] = useState(false);
  const navigatedRef = useRef(false);

  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const isGuest = useAppSelector(state =>
    isGuestUser(state.auth.userDetails, state.auth.isGuest),
  );
  const token = useAppSelector(state => state.auth.token);
  const profileQueryEnabled = !isGuest && !!token && isAuthenticated;
  const { data: userData, isLoading } = useProfileSplashScreen(
    profileQueryEnabled,
    token || '',
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    void ensureCurrentLocationHydrated(dispatch, queryClient, () =>
      store.getState(),
    );
  }, [token, isAuthenticated, dispatch]);

  const onAnimationFinish = useCallback(() => {
    setAnimationFinished(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationFinished(true);
    }, SPLASH_MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!animationFinished || navigatedRef.current) return;

    if (!isAuthenticated || !token) {
      navigatedRef.current = true;
      resetAndNavigate(SCREEN_NAMES.LOGIN);
      return;
    }

    if (isGuest) {
      navigatedRef.current = true;
      resetAndNavigate(SCREEN_NAMES.HOME);
      return;
    }

    if (profileQueryEnabled && isLoading) return;

    if (userData?.succeeded) {
      navigatedRef.current = true;
      const hasInterests =
        userData?.ResponseData?.interests &&
        userData.ResponseData.interests.length > 0;
      if (hasInterests) {
        dispatch(setUserCity(userData.ResponseData?.city));
        resetAndNavigate(SCREEN_NAMES.HOME);
        setTimeout(() => tryOpenPendingProviderProfile(), 600);
      } else {
        resetAndNavigate(SCREEN_NAMES.INTEREST_CHOOSE, { prevScreen: 'auth' });
      }
      return;
    }

    if (profileQueryEnabled && !isLoading) {
      navigatedRef.current = true;
      resetAndNavigate(SCREEN_NAMES.LOGIN);
    }
  }, [
    animationFinished,
    isAuthenticated,
    isGuest,
    token,
    profileQueryEnabled,
    isLoading,
    userData,
    dispatch,
  ]);

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={[...theme.colors.gradientColor]}
      >
        <SplashAnimation onAnimationFinish={onAnimationFinish} />
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
