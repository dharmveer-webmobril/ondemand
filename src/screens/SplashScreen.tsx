import {     StyleSheet  } from 'react-native';
import React from 'react';
import { Container } from '../component';
import { Colors, Fonts, SF,  } from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import {  useNavigation } from '@react-navigation/native';
// import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
// import * as Keychain from 'react-native-keychain';
// import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import { RootState, useGetUserProfileQuery } from '../redux';

const SplashScreen: React.FC = () => {
 const navigation = useNavigation<any>();

  const token = useSelector((state: RootState) => state.auth.token);

  const { data: profileData, isSuccess, isError } = useGetUserProfileQuery(undefined, {
    skip: !token, // fetch only if token exists
  });

  console.log('profileDataprofileData', profileData?.data?.user);

  const handleAnimationFinish = () => {
    if (token) {
      if (isSuccess && profileData) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else if (isError) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } else {
      // no token, go to login
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };



  return (
    <Container isAuth={true} statusBarStyle="light-content" statusBarColor={Colors.themeDarkColor}>
      <LinearGradient
        style={styles.linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['#1A434E', '#204f5c']}
      >
        <LottieView
          source={require('../assets/lottie/loading.json')}  
          autoPlay  
          loop={false}  
          resizeMode='cover'
          style={styles.lottieView}
          onAnimationFinish={handleAnimationFinish}
        />

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
