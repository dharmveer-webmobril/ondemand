import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
// import LottieView from 'lottie-react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '@utils/theme';
interface LoadingCompProps {
    visible: boolean;
    message?: string;
}

const LoadingComp: React.FC<LoadingCompProps> = ({ visible }) => {
    const theme = useThemeContext();
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            statusBarTranslucent={true}
            onRequestClose={() => { }}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    {/* <LottieView
            source={require('../assets/lottie/loader.json')} // Replace with your loading animation JSON
            autoPlay
            loop
            style={styles.lottie}
          /> */}
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        </Modal>
    );
};

export default LoadingComp;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        alignItems: 'center',
        // elevation: 5,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
    },
    lottie: {
        width: 90,
        height: 90,
    },
});