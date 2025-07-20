import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import Geolocation, {
  GeoPosition,
  GeoError,
} from 'react-native-geolocation-service';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  Permission,
  PermissionStatus,
} from 'react-native-permissions';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  retry: () => void;
}

const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const permission: Permission | undefined = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });

  const getLocation = useCallback(() => {
    setIsLoading(true);
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setError(null);
        setIsLoading(false);
      },
      (err: GeoError) => {
        setError(err.message);
        setIsLoading(false);
        Alert.alert('Error', `Failed to get location: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, []);

  const requestLocationPermission = useCallback(async () => {
    if (!permission) {
      setError('Permission type is undefined for this platform');
      return;
    }

    try {
      setIsLoading(true);
      const result: PermissionStatus = await check(permission);

      if (result === RESULTS.GRANTED) {
        getLocation();
      } else if (result === RESULTS.DENIED) {
        const requestResult: PermissionStatus = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          getLocation();
        } else {
          setIsLoading(false);
          Alert.alert(
            'Location Permission Denied',
            'Please enable location access in settings to use this feature.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() },
            ]
          );
        }
      } else if (result === RESULTS.BLOCKED) {
        setIsLoading(false);
        Alert.alert(
          'Location Permission Blocked',
          'Location access is blocked. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      Alert.alert('Error', `Permission error: ${err.message}`);
    }
  }, [permission, getLocation]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const retry = useCallback(() => {
    setError(null);
    requestLocationPermission();
  }, [requestLocationPermission]);

  return { location, error, isLoading, retry };
};

export default useLocation;
