import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Container } from '../component';
import { checkLocationPermission, Colors, ENDPOINTS, Fonts, SF, StorageProvider, useProfileUpdate } from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setToken } from '../redux';
import RouteName from '../navigation/RouteName';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const token = useSelector((state: RootState) => state.auth.token);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useProfileUpdate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        setLoading(true);
        try {
          const response = await fetch(process.env.API_URL + ENDPOINTS.GET_PROFILE, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('responseresponse',response);
          
          const data = await response.json();
          if (response?.ok) {
            setProfileData(data);
            setError(false);
          } else {
            console.error('Failed to fetch profile:', data);
            throw new Error(data.message || 'Failed to fetch profile');
          }
        } catch (err) {
          dispatch(setToken({ token: '' }));
          StorageProvider.removeItem('token');
          navigation.reset({ index: 0, routes: [{ name: RouteName.LOGIN }] });
          console.error('Profile fetch error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError(false); // No token, no error, just proceed to login
      }
    };

    fetchUserProfile();
  }, [token]);
  
  const dispatch = useDispatch()

  const handleAnimationFinish = async () => {
    await checkLocationPermission();
    if (loading) return; // Wait for fetch to complete

    if (token) {
      if (!error && profileData) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else if (error) {
        dispatch(setToken({ token: '' }));
        StorageProvider.removeItem('token');
        navigation.reset({ index: 0, routes: [{ name: RouteName.LOGIN }] });
      }
    } else {
      dispatch(setToken({ token: '' }));
      StorageProvider.removeItem('token');
      navigation.reset({ index: 0, routes: [{ name: RouteName.LOGIN }] });
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