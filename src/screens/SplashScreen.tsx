import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Container, LogoAnimated } from '../component';
import { checkLocationPermission, Colors, Fonts, SF, StorageProvider, useProfileUpdate } from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux';
import RouteName from '../navigation/RouteName';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  useProfileUpdate();

  const dispatch = useDispatch()

  const handleAnimationFinish = async () => {
    await checkLocationPermission();
    const loginToken = await StorageProvider.getItem('token');
    if (loginToken) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } else {
      dispatch(setToken({ token: '' }));
      StorageProvider.removeItem('token');
      navigation.reset({ index: 0, routes: [{ name: RouteName.LOGIN }] });
    }
  };
  useEffect(() => {
    setTimeout(() => {
      handleAnimationFinish()
    }, 4500);
  }, [])

  return (
    <Container isAuth={true} statusBarStyle="light-content" statusBarColor={Colors.themeDarkColor}>
      <LinearGradient
        style={styles.linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={Colors.gradientColor}
      >
        <LogoAnimated />
      </LinearGradient>
    </Container>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  logo: {
    height: SF(246),
    width: SF(196),
  },
  appTitle: {
    fontFamily: Fonts.EXTRA_BOLD,
    fontSize: SF(34),
    marginTop: 10,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: Fonts.BOLD,
    fontSize: SF(20),
    marginTop: 10,
    color: Colors.white,
  },
});