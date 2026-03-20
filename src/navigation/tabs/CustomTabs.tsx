import React, { useMemo } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SH, ThemeType, useThemeContext } from "@utils";
import { CustomText } from "@components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabImages from "./TabImages";
import i18next from "i18next";

export const CustomTabs: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
    const theme = useThemeContext();
    const bottom = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const getName = (name: string) => {
        switch (name) {
            case "Home":
                return i18next.t('tabs.home');
            case "Profile":
                return i18next.t('tabs.profile');
            case "InboxScreen":
                return i18next.t('tabs.message');
            case "BookingList":
                return i18next.t('tabs.myBookings');
            default:
                return '';
        }
    };
    return (
        <View pointerEvents="box-none">
            <View style={[styles.tabContainer, { height: SH(75) + bottom.bottom }]}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: theme.SH(15),
                    width: "100%",
                }}>
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
        </View>
    );
};

const createStyles = (theme: ThemeType) => {
    const { colors } = theme;

    return StyleSheet.create({
        tabContainer: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            alignSelf: "center",
            paddingBottom: 10,
            alignItems: "flex-start",
            marginTop: theme.SH(20),
            zIndex: 9999,
            elevation: 20,
        },

        tabItem: {
            justifyContent: "center",
            alignItems: "center",
            // paddingVertical: 10,
            paddingHorizontal: 20,
        },

        focusedTabItem: {
            borderBottomColor: colors.primary,
        },
    });
};
