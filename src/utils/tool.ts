import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  Permission,
} from 'react-native-permissions';
import { Platform, Alert, Linking } from 'react-native';

export const requestCameraAccess = async (): Promise<boolean> => {
  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

  let result = await check(permission);

  if (result === RESULTS.GRANTED) return true;

  // Ask the user if not already granted
  result = await request(permission);

  if (result === RESULTS.GRANTED) {
    return true;
  } else if (result === RESULTS.BLOCKED) {
    Alert.alert(
      'Permission Blocked',
      'Camera permission is blocked. Please enable it from settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings() },
      ],
    );
  } else {
    Alert.alert(
      'Permission Denied',
      'Camera access is required to take pictures.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try Again', onPress: () => requestCameraAccess() },
      ],
    );
  }

  return false;
};

export const formatChatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return timeString; // e.g., "03:15 PM"
  } else {
    const dateString = date.toLocaleDateString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return `${dateString} ${timeString}`; // e.g., "23 Jul 2025 03:15 PM"
  }
};

// At the bottom of the file

export const checkLocationPermission = async (): Promise<boolean> => {
  const permission: Permission | undefined = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });

  if (!permission) return false;

  const result = await check(permission);
  if (result === RESULTS.GRANTED) return true;

  const requestResult = await request(permission);
  return requestResult === RESULTS.GRANTED;
};

export const arrangePrice = (price: number, priceType: string): string => {
  // If integer → no decimals, else → show up to 2 decimals
  const formatted = Number.isInteger(price) ? price.toString() : price.toFixed(2);

  return priceType === 'fixed' ? `$${formatted}` : `$${formatted}/hr`;
};

export const getPriceDetails = (item: any, type: any = null) => {
  const hasMarketOffer = item?.marketOffer && item?.marketOffer?.discountType;
  const originalPrice = item?.actualPrice || item?.price || 0;
  const discountValue = item?.marketOffer?.discountValue || 0;
  const discountType = item?.marketOffer?.discountType || '';
  const priceType = type ? type : item?.priceType || 'fixed'; // Default to 'fixed' if not provided
  const discountedPrice = item?.discountedPrice || (hasMarketOffer && discountType === 'percentage'
    ? originalPrice * (1 - discountValue / 100)
    : originalPrice);
  const discountedAmount = (item?.actualPrice && item?.discountedPrice) ? item?.actualPrice - item?.discountedPrice : 0
  const displayPrice = hasMarketOffer ? discountedPrice : originalPrice;
  const discountLabel = hasMarketOffer
    ? (discountType === 'percentage' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`)
    : null;

  return {
    bookingPrice:displayPrice,
    displayPrice: arrangePrice(displayPrice, priceType),
    originalPrice: arrangePrice(originalPrice, priceType),
    discountedPrice: arrangePrice(discountedAmount, 'fixed'), // Added raw discountedPrice
    showDiscountedPrice: hasMarketOffer,
    discountLabel,
  };
};

export const formatRating = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0.00';
  }

  return num.toFixed(2); // always returns 2 decimals
};

export const makeCall = async (phoneNumber: string): Promise<void> => {
  // Ensure the number starts with "+" (international format)
  const formattedNumber = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+${phoneNumber}`;

  const url = `tel:${formattedNumber}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Error", "Phone call is not supported on this device");
    } else {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error("Error opening dialer:", error);
  }
};

export const userImage = 'http://15.157.235.216:3000/v1/auth/uploads/'
export const serviceImage = 'http://15.157.235.216:3000/v1/service/uploads/'