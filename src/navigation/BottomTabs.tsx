import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'; 
import imagePaths from '../assets/images';
import { Colors, Fonts, SF, SH, widthPercent } from '../utils';
import RouteName from './RouteName';
import AllUsersList from '../screens/AllUsersList';
import { HomeScreen, InboxScreen, MyBookingScreen, ProfileScreen } from '../screens';
import { AppText } from '../component';
const SCREEN_WIDTH = Dimensions.get('window').width
const BOTTOM_ROUTE = [
  {
    name:'Home',
    Component: () => <HomeScreen />, // Replace with your actual component
    icon: imagePaths.home_tab, // Replace with your icon
    headerShown: false,
    routeName:  RouteName.HOME
  },
  {
    name: 'My Booking',
    Component: () => <MyBookingScreen />, // Replace with your actual component
    icon: imagePaths.mybooking_tab, // Replace with your icon
    headerShown: false,
    routeName: RouteName.MY_BOOKING
  },
  {
    name: 'Message',
    Component: () => <InboxScreen />, // Replace with your actual component
    icon: imagePaths.message_tab, // Replace with your icon
    headerShown: false,
    routeName: RouteName.MESSAGE_SCREEN
  },
  //   {
  //   name: 'AllUsersList',
  //   Component: () => <AllUsersList />, // Replace with your actual component
  //   icon: imagePaths.message_tab, // Replace with your icon
  //   headerShown: true,
  // },
  {
    name: 'Profile',
    Component: () => <ProfileScreen />, // Replace with your actual component
    icon: imagePaths.profile_tab, // Replace with your icon
    headerShown: false,
    routeName: RouteName.PROFILE
  },
];

const Tab = createBottomTabNavigator();

// Define styles
const styles = StyleSheet.create({
  tabBarBackgroundImage: {
    width: '100%',
    height: 70, // Adjust the height as needed
  },
  imageStyle: {
    width: SF(24),
    height: SF(24),
  },
  iconsstyles: {
    fontFamily: Fonts.PlusJakartaSans_SEMI_BOLD,
    fontWeight: '500',
    fontSize: SF(12),
  },
});

// Main Component
export default function App() {


  return (
    <Tab.Navigator
      initialRouteName={RouteName.HOME}
      // initialRouteName={'AllUsersList'}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.themeColor,
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors.white },
        headerTitleStyle: {
          color: Colors.textAppColor,
          fontFamily: Fonts.PlusJakartaSans_SEMI_BOLD,
          fontSize: 15,
        },
        tabBarShowLabel: false,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: SF(60),
          paddingTop: SF(8)
        },
      }}>
      {BOTTOM_ROUTE.map((route) => (
        <Tab.Screen
          key={route.name}
          name={route.name}
          component={route.Component}
          options={{
            headerShown: route.headerShown,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <View style={{ width: SCREEN_WIDTH / 4.2, justifyContent: "center", alignItems: "center" }}>
                <Image
                  style={[
                    styles.imageStyle,
                    {
                      tintColor: focused
                        ? Colors.themeColor
                        : Colors.textAppColor,
                    },
                  ]}
                  source={route.icon}
                />
                <AppText
                  style={[
                    styles.iconsstyles,
                    { color: focused ? Colors.themeColor : Colors.textAppColor },
                  ]}>
                  {route.name}
                </AppText>
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
