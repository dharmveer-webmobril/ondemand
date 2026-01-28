import { View, StyleSheet } from 'react-native';
import { useEffect, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeContext } from '@utils/theme';
import { SplashAnimation } from '@components';
import { resetAndNavigate } from '@utils/NavigationUtils';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import SCREEN_NAMES from '../../navigation/ScreenNames';
import { useProfileSplashScreen } from '@services/index';
import { setUserCity, } from '@store/slices/appSlice';

export default function SplashScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(), []);

  const isAuthenticated = useAppSelector(
    state => state.auth.isAuthenticated
  );
  const token = useAppSelector(state => state.auth.token);
  const { data: userData, isLoading, isFetching } = useProfileSplashScreen(true, token || '');
  const dispatch = useAppDispatch();
  useEffect(() => {
    // Wait minimum splash time
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        resetAndNavigate(SCREEN_NAMES.LOGIN);
        return;
      }

      if (userData?.succeeded && !isFetching) {
        if (userData?.ResponseData?.interests && userData?.ResponseData?.interests?.length > 0) {
          dispatch(setUserCity(userData?.ResponseData?.city));
          resetAndNavigate(SCREEN_NAMES.HOME);
          return;
        } else {
          resetAndNavigate(SCREEN_NAMES.INTEREST_CHOOSE, { prevScreen: 'auth' });
        }
      } else {
        resetAndNavigate(SCREEN_NAMES.LOGIN, { prevScreen: 'auth' });
      }
    }, 3000); // splash delay

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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



// import { View, StyleSheet } from 'react-native';
// import { useMemo } from 'react';
// import LinearGradient from 'react-native-linear-gradient';
// import { useThemeContext } from '@utils/theme';
// import LottieView from 'lottie-react-native';
// import imagePaths from '@assets';

// export default function SplashScreen() {
//   const theme = useThemeContext();
//   const styles = useMemo(() => createStyles(), []);
//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         style={styles.linearGradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//         colors={theme.colors.gradientColor}
//       >
//         <LottieView
//           source={imagePaths.logo_json}
//           autoPlay={true}
//           style={{ height: theme.size.SH(130), width: theme.size.SH(130) }}
//           loop={false}
//           onAnimationFinish={() => {
//             console.log('Animation finished');
//           }}
//         />
//       </LinearGradient>
//     </View>
//   );
// }

// const createStyles = () =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//     },
//     linearGradient: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//   });
