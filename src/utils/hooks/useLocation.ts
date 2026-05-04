import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  retry: () => void;
  /** Resolves when GPS finishes; updates `location` state. Use this when you must await coords (e.g. before reverse geocode). */
  fetchLocation: () => Promise<Location | null>;
}

const useCurrentLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // 🔹 Select Permission Based On Platform
  const permission: Permission | undefined = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });

  // 🔹 Permission Handler
  const handlePermission = async (): Promise<boolean> => {
    if (!permission) return false;

    try {
      const status = await check(permission);

      // ✅ Already granted
      if (status === RESULTS.GRANTED) {
        setHasPermission(true);
        return true;
      }

      // 🔹 First time / denied
      if (status === RESULTS.DENIED) {
        const requestStatus = await request(permission);
        const granted = requestStatus === RESULTS.GRANTED;
        setHasPermission(granted);
        return granted;
      }

      // 🔹 Blocked (Don't ask again)
      if (status === RESULTS.BLOCKED) {
        setHasPermission(false);

        if (Platform.OS === 'android') {
          Alert.alert(
            'Location Permission Required',
            'Location permission is permanently denied. Please enable it from settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => openSettings(),
              },
            ],
          );
        } else {
          Alert.alert(
            'Location Permission Required',
            'Location permission is required to access your current location.',
          );
        }

        return false;
      }

      // 🔹 Unavailable
      if (status === RESULTS.UNAVAILABLE) {
        setError('Location services are not available on this device.');
        return false;
      }

      return false;
    } catch (err) {
      console.log('Permission Error:', err);
      setHasPermission(false);
      return false;
    }
  };

  // 🔹 Get Location (awaitable for flows that need coords before next step)
  const fetchLocation = useCallback(async (): Promise<Location | null> => {
    setLoading(true);
    setError(null);

    const granted = await handlePermission();

    if (!granted) {
      setLoading(false);
      return null;
    }

    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          const loc: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        err => {
          setLoading(false);

          switch (err.code) {
            case 1:
              setError('Permission denied.');
              setHasPermission(false);
              break;
            case 2:
              setError('Location provider unavailable. Please enable GPS.');
              break;
            case 3:
              setError('Location request timed out. Please try again.');
              break;
            default:
              setError(err.message);
          }

          console.log('Location Error:', err);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 10000,
        },
      );
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    void fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    loading,
    error,
    hasPermission,
    retry,
    fetchLocation,
  };
};

export default useCurrentLocation;
