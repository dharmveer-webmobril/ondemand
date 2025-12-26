import { View, Text, Image } from 'react-native'
import React from 'react'
import imagePaths from '@assets';
import { useThemeContext } from '@utils/theme';

interface TabProps {
    name: any;
}

interface IconProp {
    focused: boolean;
}

export default function TabImages({ name, focused }: TabProps & IconProp) {
    const theme = useThemeContext();
    const getIconName = () => {
        switch (name) {
            case "Home":
                return focused ? imagePaths.home_tab : imagePaths.home_tab;
            case "Profile":
                return focused ? imagePaths.profile_tab : imagePaths.profile_tab;
            case "ChatScreen":
                return focused ? imagePaths.message_tab : imagePaths.message_tab;
            case "BookingList":
                return focused ? imagePaths.mybooking_tab : imagePaths.mybooking_tab;
            default:
                return imagePaths.mybooking_tab;
        }
    };
    return (
        <View>
            <Image source={getIconName()} style={{ height: 30, width: 30, tintColor: focused ? theme.colors.primary : theme.colors.lightText }} />
        </View>
    )
}