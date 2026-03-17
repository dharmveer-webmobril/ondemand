import React, { useMemo } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemeType, useThemeContext } from "@utils";
import { CustomText } from "@components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabImages from "./TabImages";

const MIN_BOTTOM_INSET = Platform.OS === "android" ? 24 : 0;

export const CustomTabs: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
    const theme = useThemeContext();
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, MIN_BOTTOM_INSET);
    const styles = useMemo(() => createStyles(theme), [theme]);
    const getName = (name: string) => {
        switch (name) {
            case "Home":
                return 'Home';
            case "Profile":
                return 'Profile';
            case "InboxScreen":
                return 'Message';
            case "BookingList":
                return 'My Bookings';
            default:
                return '';
        }
    };
    return (
        <View style={[styles.tabBarWrap, { paddingBottom: bottomInset }]} pointerEvents="box-none">
            <View style={styles.tabContainer}>

                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={[styles.tabItem, isFocused && styles.focusedTabItem]}
                            activeOpacity={0.7}
                            onPress={() => {
                                const event = navigation.emit({
                                    type: "tabPress",
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            }}
                            onLongPress={() =>
                                navigation.emit({
                                    type: "tabLongPress",
                                    target: route.key,
                                })
                            }
                        >
                            <TabImages name={route.name} focused={isFocused} />
                            <CustomText
                                variant="h6"
                                color={isFocused ? theme.colors.primary : "#B3B3B3"}
                            >
                                {getName(route.name)}
                            </CustomText>
                        </TouchableOpacity>
                    );
                })}

            </View>
        </View>
    );
};

const createStyles = (theme: ThemeType) => {
    const { colors } = theme;

    return StyleSheet.create({
        tabBarWrap: {
            backgroundColor: "#fff",
        },
        tabContainer: {
            position: "absolute" as const,
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: "#fff",
            flexDirection: "row",
            paddingBottom: 10,
            justifyContent: "space-around",
            zIndex: 9999,
            elevation: 20,
        },

        tabItem: {
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 20,
        },

        focusedTabItem: {
            borderBottomColor: colors.primary,
        },
    });
};
