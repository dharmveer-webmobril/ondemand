import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingComponentProps {
  visible: boolean;
  message?: string;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ visible }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => { }}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <LottieView
            source={require('../assets/lottie/loader.json')} // Replace with your loading animation JSON
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingComponent;

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