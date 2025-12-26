// src/navigation/AuthNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "@utils/NavigationUtils";
import { ForgotPass, Login, OtpVerify, Signup, UpdatePass, IntrestChoose } from "@screens/auth";
import { AUTH_SCREENS } from "./ScreenNames";




const Stack = createNativeStackNavigator<any>();

export default function AuthNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={AUTH_SCREENS.LOGIN} component={Login} />
        <Stack.Screen name={AUTH_SCREENS.INTEREST_CHOOSE} component={IntrestChoose} />
        <Stack.Screen name={AUTH_SCREENS.SIGNUP} component={Signup} />
        <Stack.Screen name={AUTH_SCREENS.OTP_VERIFY} component={OtpVerify} />
        <Stack.Screen name={AUTH_SCREENS.FORGOT_PASS} component={ForgotPass} />
        <Stack.Screen name={AUTH_SCREENS.UPDATE_PASS} component={UpdatePass} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
