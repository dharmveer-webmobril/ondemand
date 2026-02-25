import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  EventType,
  Event,
} from '@notifee/react-native';
// import { updateFcmToken } from '@services/api/queries/authQueries';
// import { navigate } from '../navigators/NavigationService';
// import ScreenName from './screenName';

/**
 * Request Android 13+ notification permission
 */
const checkApplicationPermission = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.log('Permission request error:', error);
    }
  }
};

/**
 * Request user permission + generate FCM token
 */
export const requestUserPermission = async (): Promise<void> => {
  await checkPermissionAndGetFcmToken();
};

/**
 * Check notification permission, get FCM token, store it, and return it.
 * Call this whenever app opens / Home is focused to ensure permission and send token to backend.
 * Returns the FCM token if permission granted, null otherwise.
 */
export const checkPermissionAndGetFcmToken = async (): Promise<string | null> => {
  await checkApplicationPermission();

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log('Notification permission not granted');
    return null;
  }

  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      return fcmToken;
    }
  } catch (error) {
    console.log('Error in FCM token generation:', error);
  }
  return null;
};

/**
 * Display foreground notification using Notifee.
 * Uses messageId as notification id so the same message never shows twice (replaces if duplicated).
 */
const onDisplayNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
  if (Platform.OS === 'ios') {
    await notifee.requestPermission();
  }

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  const notificationId =
    remoteMessage.messageId || `fcm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  await notifee.displayNotification({
    id: notificationId,
    title: remoteMessage?.notification?.title,
    body: remoteMessage?.notification?.body,
    data: remoteMessage?.data,
    android: {
      channelId,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
  });
};

let foregroundUnsubscribe: (() => void) | null = null;

/**
 * Notification listeners. Safe to call multiple times; only one foreground listener is active.
 */
export const notificationListener = (): (() => void) => {
  if (foregroundUnsubscribe) {
    return foregroundUnsubscribe;
  }

  foregroundUnsubscribe = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      await onDisplayNotification(remoteMessage);
    },
  );

  messaging().onNotificationOpenedApp(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        // navigate(ScreenName.NOTIFICATION, {});
      }
    },
  );

  messaging()
    .getInitialNotification()
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        // navigate(ScreenName.NOTIFICATION, {});
      }
    });

  return foregroundUnsubscribe;
};

/**
 * Background message handler (IMPORTANT: also add in index.ts)
 */
messaging().setBackgroundMessageHandler(
  async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Handled in background:', JSON.stringify(remoteMessage));
    console.log('Handled in background:', remoteMessage);
  },
);

/**
 * Notifee Background Events
 */
notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
  const { notification } = detail;
  console.log('Notification received in background:', notification);
  switch (type) {
    case EventType.DISMISSED:
      console.log('Notification dismissed:', notification?.id);
      break;

    case EventType.PRESS:
      // navigate(ScreenName.NOTIFICATION, {});
      break;
  }
});

/**
 * Notifee Foreground Events
 */
notifee.onForegroundEvent(({ type, detail }: Event) => {
  const { notification } = detail;
  console.log('Notification received in foreground:', notification);
  switch (type) {
    case EventType.DISMISSED:
      console.log('Notification dismissed:', notification?.id);
      break;

    case EventType.PRESS:
      // navigate(ScreenName.NOTIFICATION, {});
      break;
  }
});