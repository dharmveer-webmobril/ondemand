import { View,  Image } from 'react-native'
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
                return focused ? imagePaths.home_tab_active : imagePaths.home_tab_inactive;
            case "Profile":
                return focused ? imagePaths.profile_tab_active : imagePaths.profile_tab_inactive;
            case "InboxScreen":
                return focused ? imagePaths.message_tab_active : imagePaths.message_tab_inactive;
            case "BookingList":
                return focused ? imagePaths.mybooking_tab_active : imagePaths.mybooking_tab_inactive;
            default:
                return imagePaths.home_tab_inactive;
        }
    };
    return (
        <View>
            <Image source={getIconName()} style={{ height: 24, width: 24, tintColor: focused ? theme.colors.primary : theme.colors.lightText }} />
        </View>
    )
}