import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigate } from './NavigationService';  
import RouteName from '../navigation/RouteName';

// ✅ Function to handle notification navigation
const handleNotificationNavigation = (remoteMessage: any) => {
  console.log('Handling notification:', remoteMessage);

  if (remoteMessage?.data?.screen) {
    // If notification has a target screen, navigate there
    navigate(remoteMessage.data.screen, remoteMessage.data);
  } else {
    // Default navigation if no screen is specified
    navigate(RouteName.HOME, {});
  }
};

// ✅ Request notification permissions
const checkApplicationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
      } else {
        console.log('Notification permission granted');
      }
    } catch (error) {
      console.log('Permission request error:', error);
    }
  }
};

// ✅ Request user permission for notifications
export async function requestUserPermission() {
  await checkApplicationPermission();

  if (Platform.OS === 'ios') {
    await messaging().requestPermission();
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    await getFcmToken();
  } else {
    console.log('Notification permission not granted');
  }
}

// ✅ Get and store FCM token
const getFcmToken = async () => {
  try {
    const storedToken = await AsyncStorage.getItem('fcmToken');
    console.log("Stored FCM token:", storedToken);

    if (!storedToken) {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("Generated FCM token:", fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  } catch (error) {
    console.log("Error getting FCM token:", error);
  }
}

// ✅ Display notification
async function onDisplayNotification(data: any) {
  if (Platform.OS === 'ios') {
    await notifee.requestPermission();
  }

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: data?.notification?.title,
    body: data?.notification?.body,
    data: data.data,
    android: {
      channelId,
      pressAction: {
        launchActivity: "default",
        id: "default",
      },
    },
  });
}

// ✅ Notification listeners
export const notificationListener = async () => {
  // Foreground notification
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Foreground Notification:', remoteMessage);
    await onDisplayNotification(remoteMessage);
  });

  // Background notification opens
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('App opened from background by notification:', remoteMessage);
    handleNotificationNavigation(remoteMessage);
  });

  // Initial notification when app is launched from quit state
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('App opened from quit state by notification:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    }
  });

  // Background message handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background Notification:', remoteMessage);
    if (remoteMessage) {
      handleNotificationNavigation(remoteMessage);
    }
  });

  return unsubscribe;
};

// ✅ Handle Notifee background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;
  if (type === EventType.PRESS) {
    console.log('Background Notification pressed:', notification);
    handleNotificationNavigation(notification);
  }
});

// ✅ Handle Notifee foreground events
notifee.onForegroundEvent(async ({ type, detail }) => {
  const { notification } = detail;
  if (type === EventType.PRESS) {
    console.log('Foreground Notification pressed:', notification);
    handleNotificationNavigation(notification);
  }
});
