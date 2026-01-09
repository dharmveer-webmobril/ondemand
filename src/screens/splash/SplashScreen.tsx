import { View, StyleSheet } from 'react-native';
import { useEffect, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeContext } from '@utils/theme';
import { SplashAnimation } from '@components';
import { resetAndNavigate } from '@utils/NavigationUtils';
import { useAppSelector } from '@store/hooks';
import SCREEN_NAMES from '../../navigation/ScreenNames';
import { useProfileSplashScreen } from '@services/index';

export default function SplashScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(), []);

  const isAuthenticated = useAppSelector(
    state => state.auth.isAuthenticated
  );
  const token = useAppSelector(state => state.auth.token);
  const { data: userData, isLoading, isFetching } = useProfileSplashScreen(true, token || '');

  useEffect(() => {
    // Wait minimum splash time
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        resetAndNavigate(SCREEN_NAMES.LOGIN);
        return;
      }

      if (userData?.succeeded && !isFetching) {
        if (userData?.ResponseData?.interests && userData?.ResponseData?.interests?.length > 0) {
          resetAndNavigate(SCREEN_NAMES.HOME);
          return;
        } else {
          resetAndNavigate(SCREEN_NAMES.INTEREST_CHOOSE, { prevScreen: 'auth' });
        }
      } else {
        resetAndNavigate(SCREEN_NAMES.LOGIN, { prevScreen: 'auth' });
      }
    }, 5000); // splash delay

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, userData, isFetching]);

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={theme.colors.gradientColor}
      >
        <SplashAnimation />
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
