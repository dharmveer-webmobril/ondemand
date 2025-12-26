import React, { useMemo } from 'react';
import { StyleSheet,  ViewStyle } from 'react-native';
import { Tab, TabView, Layout } from '@ui-kitten/components';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

export type BookingTabItem = {
    id: number | string;
    name: string;
    type: string;
};

type BookingTabsProps = {
    tabs: BookingTabItem[];
    selectedIndex?: number;
    onTabPress: (index: number, tab: BookingTabItem) => void;
};

export default function BookingTabs({
    tabs,
    selectedIndex: controlledIndex,
    onTabPress,
}: BookingTabsProps) {
    const [internalIndex, setInternalIndex] = React.useState(0);
    const selectedIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

    const theme = useThemeContext();
    const styles = useMemo(() => createStyle(theme, selectedIndex), [theme]);

    const handleSelect = (index: number) => {
        if (controlledIndex === undefined) {
            setInternalIndex(index);
        }
        onTabPress(index, tabs[index]);
    };

    return (
        <TabView
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            indicatorStyle={{ display: 'none' }}
            tabBarStyle={styles.tabBar}
        >
            {tabs.map((tab, index) => (
                <Tab
                    key={tab.id}
                    title={() => <CustomText variant="h5" color={selectedIndex === index ? theme.colors.white : theme.colors.primary}>{tab.name}</CustomText>}
                    style={[
                        styles.tab,
                        { backgroundColor: selectedIndex === index ? theme.colors.primary : theme.colors.white },
                    ]}
                >
                    <Layout style={styles.tabContainer}>
                        <CustomText variant="h5" color={selectedIndex === index ? theme.colors.primary : theme.colors.white}>{tab.name}</CustomText>
                    </Layout>
                </Tab>
            ))}
        </TabView>
    );
}

// Styles
const createStyle = (theme: ThemeType, selectedIndex: number) => {
    return StyleSheet.create({
        tabBar: {
            backgroundColor: '#FFFFFF',
            alignSelf: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            overflow: 'hidden',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            paddingVertical: 0,
            padding: 0,
            margin: 0,
        } as ViewStyle,

        tab: {
            height: 48,
            margin: 4,
            borderRadius: 10,
            justifyContent: 'center',
            marginVertical: 0,
            marginHorizontal:0
        } as ViewStyle,

        tabContainer: {
            minHeight: 200,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
    });
};