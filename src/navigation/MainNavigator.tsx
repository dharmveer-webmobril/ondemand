import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ForgotPass, IntrestChoose, Login, OtpVerify, Signup, UpdatePass, TermsAndConditions, ChatScreen, ProfileSetup, ChangePassword, MyAddress, AddAddress, SelectAddress, CategoryProviders, CategoryList, FeaturedServicesList, ProviderDetailsScreen, ServiceDetail, ServiceFeePolicy, PaymentPolicy, Report, BookAppointment, BookingDetail, RoutineBookingDetail, Checkout, AddOtherPersonDetail, BookingSummery, PaymentWebViewScreen, TrackingWebViewScreen, WalletScreen, PaymentTransactionsScreen, ReferEarnScreen, NotificationsScreen, NotificationsAlerts, CustomerSupport, CreateSupportTicket, SupportTicketDetail, LanguageSettings, FavoriteProvidersScreen, HomeQuickVoiceScreen } from '@screens/index'
import SecuritySettings from '@screens/settings/SecuritySettings'
import SplashScreen from '@screens/splash/SplashScreen'
import { navigationRef } from '@utils/NavigationUtils'
import { linking } from './linking'
import BottomTabs from './tabs/BottomsTabs'
import { SCREEN_NAMES } from './ScreenNames'

const Stack = createNativeStackNavigator()
const MainNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name={SCREEN_NAMES.SPLASH}
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name={SCREEN_NAMES.LOGIN} component={Login} />
        <Stack.Screen name={SCREEN_NAMES.INTEREST_CHOOSE} component={IntrestChoose} />
        <Stack.Screen name={SCREEN_NAMES.SIGNUP} component={Signup} />
        <Stack.Screen name={SCREEN_NAMES.OTP_VERIFY} component={OtpVerify} />
        <Stack.Screen name={SCREEN_NAMES.FORGOT_PASS} component={ForgotPass} />
        <Stack.Screen name={SCREEN_NAMES.UPDATE_PASS} component={UpdatePass} />
        <Stack.Screen name={SCREEN_NAMES.TERMS_AND_CONDITIONS} component={TermsAndConditions} />
        <Stack.Screen name={SCREEN_NAMES.HOME} component={BottomTabs} />
        <Stack.Screen name={SCREEN_NAMES.CHAT_SCREEN} component={ChatScreen} />
        <Stack.Screen name={SCREEN_NAMES.PROFILE_SETUP} component={ProfileSetup} />
        <Stack.Screen name={SCREEN_NAMES.CHANGE_PASSWORD} component={ChangePassword} />
        <Stack.Screen name={SCREEN_NAMES.MY_ADDRESS} component={MyAddress} />
        <Stack.Screen name={SCREEN_NAMES.ADD_ADDRESS} component={AddAddress} />
        <Stack.Screen name={SCREEN_NAMES.SELECT_ADDRESS} component={SelectAddress} />
        <Stack.Screen name={SCREEN_NAMES.CATEGORY_PROVIDERS} component={CategoryProviders} />
        <Stack.Screen name={SCREEN_NAMES.CATEGORY_LIST} component={CategoryList} />
        <Stack.Screen name={SCREEN_NAMES.FEATURED_SERVICES_LIST} component={FeaturedServicesList} />
        <Stack.Screen name={SCREEN_NAMES.PROVIDER_DETAILS} component={ProviderDetailsScreen} />
        <Stack.Screen name={SCREEN_NAMES.SERVICE_DETAIL} component={ServiceDetail} />
        <Stack.Screen name={SCREEN_NAMES.SERVICE_FEE_POLICY} component={ServiceFeePolicy} />
        <Stack.Screen name={SCREEN_NAMES.PAYMENT_POLICY} component={PaymentPolicy} />
        <Stack.Screen name={SCREEN_NAMES.REPORT} component={Report} />
        <Stack.Screen name={SCREEN_NAMES.BOOK_APPOINTMENT} component={BookAppointment} />
        <Stack.Screen name={SCREEN_NAMES.BOOKING_DETAIL} component={BookingDetail} />
        <Stack.Screen name={SCREEN_NAMES.ROUTINE_BOOKING_DETAIL} component={RoutineBookingDetail} />
        <Stack.Screen name={SCREEN_NAMES.CHECKOUT} component={Checkout} />
        <Stack.Screen name={SCREEN_NAMES.ADD_OTHER_PERSON_DETAIL} component={AddOtherPersonDetail} />
        <Stack.Screen name={SCREEN_NAMES.BOOKING_SUMMARY} component={BookingSummery} />
        <Stack.Screen name={SCREEN_NAMES.PAYMENT_WEBVIEW} component={PaymentWebViewScreen} />
        <Stack.Screen name={SCREEN_NAMES.TRACKING_WEBVIEW} component={TrackingWebViewScreen} />
        <Stack.Screen name={SCREEN_NAMES.WALLET} component={WalletScreen} />
        <Stack.Screen name={SCREEN_NAMES.PAYMENT_TRANSACTIONS} component={PaymentTransactionsScreen} />
        <Stack.Screen name={SCREEN_NAMES.REFER_EARN} component={ReferEarnScreen} />
        <Stack.Screen name={SCREEN_NAMES.NOTIFICATIONS} component={NotificationsScreen} />
        <Stack.Screen name={SCREEN_NAMES.NOTIFICATIONS_ALERTS} component={NotificationsAlerts} />
        <Stack.Screen name={SCREEN_NAMES.CUSTOMER_SUPPORT} component={CustomerSupport} />
        <Stack.Screen name={SCREEN_NAMES.CREATE_SUPPORT_TICKET} component={CreateSupportTicket} />
        <Stack.Screen name={SCREEN_NAMES.SUPPORT_TICKET_DETAIL} component={SupportTicketDetail} />
        <Stack.Screen name={SCREEN_NAMES.SECURITY_SETTINGS} component={SecuritySettings} />
        <Stack.Screen name={SCREEN_NAMES.LANGUAGE_SETTINGS} component={LanguageSettings as any} />
        <Stack.Screen name={SCREEN_NAMES.FAVORITE_PROVIDERS} component={FavoriteProvidersScreen} />
        <Stack.Screen name={SCREEN_NAMES.HOME_QUICK_VOICE} component={HomeQuickVoiceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default MainNavigator
