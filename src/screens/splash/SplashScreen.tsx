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
import { hydrateAuthToken } from '@services/auth/authTokenService';
import { authenticateWithBiometrics } from '@services/auth/biometricService';

const SPLASH_MAX_WAIT_MS = 4500;

export default function SplashScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(), []);

  const [animationFinished, setAnimationFinished] = useState(false);
  const [tokenHydrated, setTokenHydrated] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);

  const navigatedRef = useRef(false);
  const hydrationStartedRef = useRef(false);
  const biometricStartedRef = useRef(false);
  const legacyTokenRef = useRef<string | null>(null);

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const isGuest = useAppSelector(state =>
    isGuestUser(state.auth.userDetails, state.auth.isGuest),
  );
  const token = useAppSelector(state => state.auth.token);
  const biometricEnabled = useAppSelector(state => state.auth.biometricEnabled);

  legacyTokenRef.current = token;

  const profileQueryEnabled =
    tokenHydrated && !isGuest && !!token && isAuthenticated && biometricVerified;

  const { data: userData, isLoading } = useProfileSplashScreen(
    profileQueryEnabled,
    token || '',
  );

  useEffect(() => {
    if (hydrationStartedRef.current) {
      return;
    }
    hydrationStartedRef.current = true;

    (async () => {
      try {
        await hydrateAuthToken(dispatch, legacyTokenRef.current);
      } catch {
        // Hydration failure is handled during navigation
      } finally {
        setTokenHydrated(true);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      return;
    }
    void ensureCurrentLocationHydrated(dispatch, queryClient, () =>
      store.getState(),
    );
  }, [token, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!tokenHydrated || biometricStartedRef.current) {
      return;
    }

    const state = store.getState().auth;
    const currentToken = state.token;

    if (!state.isAuthenticated || !currentToken) {
      biometricStartedRef.current = true;
      setBiometricVerified(true);
      return;
    }

    if (isGuestUser(state.userDetails, state.isGuest)) {
      biometricStartedRef.current = true;
      setBiometricVerified(true);
      return;
    }

    if (!state.biometricEnabled) {
      biometricStartedRef.current = true;
      setBiometricVerified(true);
      return;
    }

    biometricStartedRef.current = true;

    (async () => {
      try {
        await authenticateWithBiometrics('Authenticate to access your account');
        setBiometricVerified(true);
      } catch {
        navigatedRef.current = true;
        resetAndNavigate(SCREEN_NAMES.LOGIN);
      }
    })();
  }, [tokenHydrated, biometricEnabled]);

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
    if (!animationFinished || !tokenHydrated || !biometricVerified || navigatedRef.current) {
      return;
    }

    const state = store.getState().auth;
    const currentToken = state.token;

    if (!state.isAuthenticated || !currentToken) {
      navigatedRef.current = true;
      resetAndNavigate(SCREEN_NAMES.LOGIN);
      return;
    }

    if (isGuestUser(state.userDetails, state.isGuest)) {
      navigatedRef.current = true;
      resetAndNavigate(SCREEN_NAMES.HOME);
      return;
    }

    if (profileQueryEnabled && isLoading) {
      return;
    }

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
    tokenHydrated,
    biometricVerified,
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
