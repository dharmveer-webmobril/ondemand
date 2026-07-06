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
  CATEGORY_LIST: 'CategoryList',
  FEATURED_SERVICES_LIST: 'FeaturedServicesList',
  PROVIDER_DETAILS: 'ProviderDetails',
  SERVICE_DETAIL: 'ServiceDetail',
  SERVICE_FEE_POLICY: 'ServiceFeePolicy',
  PAYMENT_POLICY: 'PaymentPolicy',
  REPORT: 'Report',
  BOOK_APPOINTMENT: 'BookAppointment',
  BOOKING_DETAIL: 'BookingDetail',
  ROUTINE_BOOKING_DETAIL: 'RoutineBookingDetail',
  CHECKOUT: 'Checkout',
  ADD_OTHER_PERSON_DETAIL: 'AddOtherPersonDetail',
  BOOKING_SUMMARY: 'BookingSummary',
  PAYMENT_WEBVIEW: 'PaymentWebView',
  TRACKING_WEBVIEW: 'TrackingWebView',
  WALLET: 'Wallet',
  PAYMENT_TRANSACTIONS: 'PaymentTransactions',
  NOTIFICATIONS: 'Notifications',
  NOTIFICATIONS_ALERTS: 'NotificationsAlerts',
  CUSTOMER_SUPPORT: 'CustomerSupport',
  CREATE_SUPPORT_TICKET: 'CreateSupportTicket',
  SUPPORT_TICKET_DETAIL: 'SupportTicketDetail',
  SECURITY_SETTINGS: 'SecuritySettings',
  LANGUAGE_SETTINGS: 'LanguageSettings',
  FAVORITE_PROVIDERS: 'FavoriteProviders',
  REFER_EARN: 'ReferEarn',
  /** Home → voice + assistant search for services / providers */
  HOME_QUICK_VOICE: 'HomeQuickVoice',
} as const;
export default SCREEN_NAMES;
// Type for screen names
export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];

