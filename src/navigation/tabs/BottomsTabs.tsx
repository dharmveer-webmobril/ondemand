import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookingList, Home, InboxScreen, ProfileScreen } from '@screens/index';
import { CustomTabs } from './CustomTabs';
import SCREEN_NAMES, { TAB_SCREENS } from '../ScreenNames';

const Tab = createBottomTabNavigator();
export default function BottomTabs() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabs {...props} />}
            screenOptions={() => ({
                headerShown: false,
            })}
        >
            <Tab.Screen name={TAB_SCREENS.HOME} component={Home} />
            <Tab.Screen name={TAB_SCREENS.BOOKING_LIST} component={BookingList} />
            <Tab.Screen name={SCREEN_NAMES.INBOX_SCREEN} component={InboxScreen} />
            <Tab.Screen name={TAB_SCREENS.PROFILE} component={ProfileScreen} />
        </Tab.Navigator>
    );
}
