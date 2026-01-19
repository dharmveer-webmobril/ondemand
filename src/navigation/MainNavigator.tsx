import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ForgotPass, IntrestChoose, Login, OtpVerify, Signup, UpdatePass, TermsAndConditions, ChatScreen, ProfileSetup, ChangePassword, MyAddress, AddAddress, SelectAddress, CategoryProviders, ProviderDetailsScreen, ServiceFeePolicy, PaymentPolicy, Report, BookAppointment, BookingDetail } from '@screens/index'
import SplashScreen from '@screens/splash/SplashScreen'
import { navigationRef } from '@utils/NavigationUtils'
import BottomTabs from './tabs/BottomsTabs'
import { SCREEN_NAMES } from './ScreenNames'

const Stack = createNativeStackNavigator()
const MainNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name={SCREEN_NAMES.SPLASH} component={SplashScreen} />
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
        <Stack.Screen name={SCREEN_NAMES.PROVIDER_DETAILS} component={ProviderDetailsScreen} />
        <Stack.Screen name={SCREEN_NAMES.SERVICE_FEE_POLICY} component={ServiceFeePolicy} />
        <Stack.Screen name={SCREEN_NAMES.PAYMENT_POLICY} component={PaymentPolicy} />
        <Stack.Screen name={SCREEN_NAMES.REPORT} component={Report} />
        <Stack.Screen name={SCREEN_NAMES.BOOK_APPOINTMENT} component={BookAppointment} />
        <Stack.Screen name={SCREEN_NAMES.BOOKING_DETAIL} component={BookingDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default MainNavigator
