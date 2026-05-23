import React, { useMemo } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SH, ThemeType, useThemeContext } from "@utils";
import { CustomText } from "@components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import TabImages from "./TabImages";

/** Base tab bar content height (before safe-area). Keep in sync with tab bar layout. */
export const TAB_BAR_BASE_HEIGHT = 75;

const TAB_LABEL_KEYS: Record<string, string> = {
  Home: "tabs.home",
  Profile: "tabs.profile",
  InboxScreen: "tabs.message",
  BookingList: "tabs.myBookings",
};

export const CustomTabs: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
    const theme = useThemeContext();
    const bottom = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t, i18n } = useTranslation();

    const tabLabels = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const [route, key] of Object.entries(TAB_LABEL_KEYS)) {
            labels[route] = t(key);
        }
        return labels;
    }, [t, i18n.language]);

    return (
        <View pointerEvents="box-none">
            <View
              style={[
                styles.tabContainer,
                { height: SH(TAB_BAR_BASE_HEIGHT) + bottom.bottom },
              ]}
            >
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: theme.SH(15),
                    width: "100%",
                }}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        const label = tabLabels[route.name] ?? '';
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
                                    {label}
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
            paddingHorizontal: 20,
        },

        focusedTabItem: {
            borderBottomColor: colors.primary,
        },
    });
};
