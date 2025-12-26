import { SH } from '@utils/dimensions';
import { useThemeContext } from '@utils/theme';
import React from 'react';
import { View, Platform, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type AuthBottomContainerProps = {
    children?: React.ReactNode; // Children elements to render inside the container
    style?: ViewStyle; // Additional styles for the container
};

const AuthBottomContainer: React.FC<AuthBottomContainerProps> = ({
    children,
    style,
}) => {
    const theme = useThemeContext();
    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.gradient,]}
            colors={theme.colors.gradientColor}
        >
            <View
                style={[
                    styles.container,
                    style
                ]}
            >
                {children}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: SH(40),
        borderTopRightRadius: SH(40),
        flex: 1,
    },
    gradient: {
        flex: 1,
        borderTopLeftRadius: SH(40),
        borderTopRightRadius: SH(40),
    },
});

export default AuthBottomContainer;
