/**
 * Screen Names Constants
 * Centralized file for all screen names used in navigation
 */

// Auth Screens
export const AUTH_SCREENS = {
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  OTP_VERIFY: 'OtpVerify',
  FORGOT_PASS: 'ForgotPass',
  UPDATE_PASS: 'UpdatePass',
  INTEREST_CHOOSE: 'IntrestChoose',
  TERMS_AND_CONDITIONS: 'TermsAndConditions',
} as const;

// Main Screens
export const MAIN_SCREENS = {
  SPLASH: 'SplashScreen',
  HOME: 'Home',
} as const;

// Tab Screens
export const TAB_SCREENS = {
  HOME: 'Home',
  BOOKING_LIST: 'BookingList',
  PROFILE: 'Profile',
} as const;
// All Screen Names (combined)
export const SCREEN_NAMES = {
  ...AUTH_SCREENS,
  ...MAIN_SCREENS,
  ...TAB_SCREENS,
  CHAT_SCREEN: 'ChatScreen',
  INBOX_SCREEN: 'InboxScreen',
  PROFILE_SETUP: 'ProfileSetup',
  CHANGE_PASSWORD: 'ChangePassword',
  MY_ADDRESS: 'MyAddress',
  ADD_ADDRESS: 'AddAddress',
  SELECT_ADDRESS: 'SelectAddress',
  CATEGORY_PROVIDERS: 'CategoryProviders',
  PROVIDER_DETAILS: 'ProviderDetails',
  SERVICE_FEE_POLICY: 'ServiceFeePolicy',
  PAYMENT_POLICY: 'PaymentPolicy',
  REPORT: 'Report',
  BOOK_APPOINTMENT: 'BookAppointment',
} as const;
export default SCREEN_NAMES;
// Type for screen names
export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];

