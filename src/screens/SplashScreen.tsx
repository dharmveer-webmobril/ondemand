import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Container, LogoAnimated } from '../component';
import {  Colors, Fonts, getAddressFromCoords, SF, StorageProvider, useProfileUpdate } from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
 
import { useDispatch } from 'react-redux';
import { setHomeAddress, setToken, setUserCurrentLoc } from '../redux';
import RouteName from '../navigation/RouteName';
import useLocation from '../utils/hooks/useLocation';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  useProfileUpdate();
  const dispatch = useDispatch();

  const { location, retry } = useLocation();

  useEffect(() => {
    if (location) {
      dispatch(setUserCurrentLoc({ location: location }))

      getAddressFromCoords(location.latitude, location.longitude).then(address => {
        dispatch(setHomeAddress({ address: address }))
      }).catch(err => console.log('Error:', err));

    }
  }, [location]);


  const handleAnimationFinish = async () => {
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
    retry();
    setTimeout(() => {
      handleAnimationFinish()
    }, 5000);
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