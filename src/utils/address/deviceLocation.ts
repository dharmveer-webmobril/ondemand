import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import { GOOGLE_MAPS_API_KEY } from '../../config/googleMaps';
import {
  geocodeResultToCustomerLocation,
  type CustomerLocationAddress,
} from './customerLocation';

let geocoderInitialized = false;

function ensureGeocoderInit() {
  if (!geocoderInitialized) {
    Geocoder.init(GOOGLE_MAPS_API_KEY);
    geocoderInitialized = true;
  }
}

function isLocationAccessGranted(status: string): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

async function ensureLocationPermission(): Promise<boolean> {
  const permission: Permission | undefined = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });
  if (!permission) return false;

  try {
    const status = await check(permission);
    if (isLocationAccessGranted(status)) return true;
    if (status === RESULTS.BLOCKED || status === RESULTS.UNAVAILABLE) {
      return false;
    }
    const requestStatus = await request(permission);
    return isLocationAccessGranted(requestStatus);
  } catch {
    return false;
  }
}

function getCurrentPosition(timeoutMs: number): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('LOCATION_TIMEOUT'));
    }, timeoutMs);

    Geolocation.getCurrentPosition(
      position => {
        clearTimeout(timer);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      err => {
        clearTimeout(timer);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: Math.min(timeoutMs, 20000),
        maximumAge: 0,
      },
    );
  });
}

/**
 * Gets GPS coords, reverse-geocodes via Google, returns normalized address or null.
 */
export async function tryResolveLocationFromDevice(options?: {
  /** GPS acquisition timeout (default 14000ms). */
  positionTimeoutMs?: number;
}): Promise<CustomerLocationAddress | null> {
  const positionTimeoutMs = options?.positionTimeoutMs ?? 14000;

  ensureGeocoderInit();

  const granted = await ensureLocationPermission();
  if (!granted) return null;

  try {
    const { latitude, longitude } = await getCurrentPosition(
      positionTimeoutMs,
    );
    const response = await Geocoder.from(latitude, longitude);
    const result = response.results?.[0];
    if (!result) return null;
    return geocodeResultToCustomerLocation(
      {
        address_components: result.address_components,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
      },
      latitude,
      longitude,
    );
  } catch {
    return null;
  }
}
