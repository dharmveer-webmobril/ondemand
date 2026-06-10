import { Alert, Platform } from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import { tryResolveLocationFromDevice } from '@utils/address/deviceLocation';
import type { CustomerLocationAddress } from '@utils/address/customerLocation';

type TranslateFn = (key: string) => string;

function getLocationPermission(): Permission | undefined {
  return Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });
}

function isLocationGranted(status: string): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

function showBlockedAlert(t: TranslateFn, onDone: () => void) {
  Alert.alert(t('guest.locationPermissionTitle'), t('guest.locationPermissionBlocked'), [
    { text: t('common.cancel'), style: 'cancel', onPress: onDone },
    {
      text: t('guest.openSettings'),
      onPress: () => {
        openSettings();
        onDone();
      },
    },
  ]);
}

async function requestSystemLocationPermission(
  permission: Permission,
  t: TranslateFn,
): Promise<boolean> {
  const requestStatus = await request(permission);
  if (isLocationGranted(requestStatus)) {
    return true;
  }
  if (requestStatus === RESULTS.BLOCKED) {
    await new Promise<void>(resolve => {
      showBlockedAlert(t, resolve);
    });
  }
  return false;
}

export function requestGuestLocationPermission(t: TranslateFn): Promise<boolean> {
  return new Promise(resolve => {
    void (async () => {
      const permission = getLocationPermission();
      if (!permission) {
        resolve(false);
        return;
      }

      const status = await check(permission);
      if (isLocationGranted(status)) {
        resolve(true);
        return;
      }

      if (status === RESULTS.BLOCKED) {
        showBlockedAlert(t, () => resolve(false));
        return;
      }

      Alert.alert(
        t('guest.locationPermissionTitle'),
        t('guest.locationPermissionMessage'),
        [
          { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
          {
            text: t('guest.allowLocation'),
            onPress: () => {
              void (async () => {
                const granted = await requestSystemLocationPermission(
                  permission,
                  t,
                );
                resolve(granted);
              })();
            },
          },
        ],
      );
    })();
  });
}

export async function resolveGuestLocationWithPrompt(
  t: TranslateFn,
): Promise<CustomerLocationAddress | null> {
  const granted = await requestGuestLocationPermission(t);
  if (!granted) {
    return null;
  }

  const location = await tryResolveLocationFromDevice();
  if (!location) {
    Alert.alert(t('guest.locationPermissionTitle'), t('guest.locationFetchFailed'), [
      { text: t('common.ok') },
    ]);
  }
  return location;
}
