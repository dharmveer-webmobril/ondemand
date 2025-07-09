import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RouteName from './RouteName';
import {
  ForgotScreen,
  LoginScreen,
  OtpVerifyScreen,
  PasswordUpdateScreen,
  PrivacyPolicy,
  SignupScreen,
} from '../screens/auth';
import Bottomtab from './BottomTabs';
import {NavigationContainer} from '@react-navigation/native';
import {
  ChangePassword,
  LanguageAndCurrency,
  MyCalender,
  NotificationAndAlert,
  PaymentHistory,
  ProfileSetup,
  RatingRiview,
  SplashScreen,
  ViewAll,
} from '../screens';
{
  /* learning---------------- */
}
import AllUsersList from '../screens/AllUsersList';
import ChatScreen from '../screens/ChatScreen';
{
  /* learning---------------- */
}
const Stack = createNativeStackNavigator();

export const AuthRoute = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={'SplashScreen'} component={SplashScreen} />
      <Stack.Screen name={RouteName.LOGIN} component={LoginScreen} />
      <Stack.Screen name={RouteName.FORGOT_PASS} component={ForgotScreen} />
      <Stack.Screen name={RouteName.OTP_VERIFY} component={OtpVerifyScreen} />
      <Stack.Screen name={RouteName.CHANGE_PASSWORD} component={ChangePassword}/>
    </Stack.Navigator>
  );
};

export const MainRoute = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={RouteName.HOME} component={Bottomtab} />
        {/* learning--------- */}
        <Stack.Screen name={'AllUsersList'} component={AllUsersList} />
        <Stack.Screen name={'ChatScreen'} component={ChatScreen} />
        {/* learning--------- */}
        <Stack.Screen name={RouteName.VIEW_ALL} component={ViewAll} />
        <Stack.Screen name={RouteName.SIGNUP} component={SignupScreen} />
        <Stack.Screen name={RouteName.PRIVACY_POLICY} component={PrivacyPolicy} />
        <Stack.Screen name={RouteName.PASS_UPDATE} component={PasswordUpdateScreen} />
      
        <Stack.Screen name={RouteName.PROFILE_SETUP} component={ProfileSetup} />
        <Stack.Screen name={RouteName.CHANGE_PASSWORD} component={ChangePassword}/>
        <Stack.Screen name={RouteName.MY_CALENDER} component={MyCalender} />
        <Stack.Screen name={RouteName.PAYMENT_HISTORY} component={PaymentHistory}/>
        <Stack.Screen name={RouteName.RATING_REVIEW} component={RatingRiview} />
        <Stack.Screen name={RouteName.NOTIFICATION_ALERT} component={NotificationAndAlert} />
        <Stack.Screen  name={RouteName.LANG_CURRENCY}  component={LanguageAndCurrency} />
      </Stack.Navigator>
    );
  };
