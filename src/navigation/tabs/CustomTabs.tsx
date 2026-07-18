import React, { useMemo } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View,Platform } from "react-native";
import { AnimatedPressable } from "@components/common";
import { SH, ThemeType, useThemeContext } from "@utils";
import { CustomText, GuestLoginRequiredModal } from "@components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useGuestGuard } from "@utils/hooks";
import { GUEST_BLOCKED_TAB_ROUTES } from "@utils/guest/guestAuth";
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
    const {
        isGuest,
        modalVisible,
        modalMessage,
        promptLogin,
        closeModal,
        goToLogin,
    } = useGuestGuard();

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
                { height: Platform.OS === 'ios' ? SH(TAB_BAR_BASE_HEIGHT)  : SH(TAB_BAR_BASE_HEIGHT)+ bottom.bottom},
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
                            <AnimatedPressable
                                key={route.key}
                                style={[styles.tabItem, isFocused && styles.focusedTabItem]}
                                scaleTo={0.92}
                                onPress={() => {
                                    if (
                                        isGuest &&
                                        GUEST_BLOCKED_TAB_ROUTES.has(route.name)
                                    ) {
                                        const message =
                                            route.name === 'BookingList'
                                                ? t('guest.tabBookingsMessage')
                                                : t('guest.tabMessagesMessage');
                                        promptLogin(message);
                                        return;
                                    }

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
                                    color={isFocused ? theme.colors.primary : "#B3B3B3"}
                                    style={{ fontSize: Platform.OS === 'ios' ? 14 : 12,marginTop: Platform.OS === 'ios' ? 2 : 0 }}
                                >
                                    {label}
                                </CustomText>
                            </AnimatedPressable>
                        );
                    })}
                </View>
            </View>
            <GuestLoginRequiredModal
                visible={modalVisible}
                message={modalMessage}
                onClose={closeModal}
                onLogin={goToLogin}
            />
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
