import { View, StyleSheet } from 'react-native';
import { useEffect, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeContext } from '@utils/theme';
import { SplashAnimation } from '@components';
import { navigate } from '@utils/NavigationUtils';
import { useAppSelector } from '@store/hooks';
import { SCREEN_NAMES } from '@navigation';

export default function SplashScreen() {
    const theme = useThemeContext();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);

    const styles = useMemo(() => createStyles(), []);

    useEffect(() => {
        const checkAuthAndNavigate = async () => {
            // Small delay to show splash animation (minimum 2 seconds)
            await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

            // Check if user is authenticated
            if (isAuthenticated && token) {
                // User is logged in, navigate to Home
                navigate(SCREEN_NAMES.HOME);
            } else {
                // User is not logged in, navigate to Login
                navigate(SCREEN_NAMES.LOGIN);
            }
        };

        checkAuthAndNavigate();
    }, [isAuthenticated, token]);


    return (
        <View style={styles.splasConatiner}>
            <LinearGradient
                style={styles.linearGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                colors={theme.colors.gradientColor}
            >
                <SplashAnimation />
            </LinearGradient>
        </View>
    )
}

const createStyles = () => StyleSheet.create({
    splasConatiner:{
        flex: 1,
    },
    linearGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})