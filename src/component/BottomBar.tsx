import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Colors, Fonts, imagePaths, SF, SH } from '../utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteName from '../navigation/RouteName';
import { useNavigation } from '@react-navigation/native';
import AppText from './AppText';

const BOTTOM_ROUTE = [
    {
        name: 'Home',
        icon: imagePaths.home_tab, // Replace with your icon
        routeName: RouteName.HOME
    },
    {
        name: 'Bookings',
        icon: imagePaths.mybooking_tab, // Replace with your icon
        headerShown: false,
        routeName: RouteName.MY_BOOKING
    },
    {
        name: 'Message',
        icon: imagePaths.message_tab, // Replace with your icon
        headerShown: false,
        routeName: RouteName.INBOX_SCREEN
    },
    {
        name: 'Profile',
        icon: imagePaths.profile_tab, // Replace with your icon
        headerShown: false,
        routeName: RouteName.PROFILE
    },
];

type BottomBarProps = {
    activeTab: string;
};
const boxShadow = {
    boxShadow: [
        {
            offsetX: 0,
            offsetY: 10,
            blurRadius: '30',
            spreadDistance: '0',
            color: `rgb(0, 0, 0)`,
        },
    ],
}
const BottomBar = ({ activeTab }: BottomBarProps) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    return (
        <View style={[styles.container, { bottom: insets.bottom },]}>
            {BOTTOM_ROUTE.map((route, index) => (
                <TouchableOpacity onPress={() => {
                    // Navigate to the respective route
                    navigation.navigate(route.routeName);
                }} activeOpacity={1} key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={route.icon} style={[{ width: SF(24), height: SF(24), resizeMode: 'contain', tintColor: Colors.white }, {
                        tintColor: activeTab === route.routeName
                            ? Colors.themeColor
                            : Colors.textAppColor,
                    },]} />

                    <AppText
                        style={[{
                            fontFamily: Fonts.PlusJakartaSans_SEMI_BOLD,
                            fontWeight: '500',
                            fontSize: SF(12),
                        }, { color: activeTab === route.routeName ? Colors.themeColor : Colors.textAppColor },]}
                    >
                        {route.name}
                    </AppText>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default BottomBar

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Colors.white,
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SH(9),
        boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.1)',
    }
})