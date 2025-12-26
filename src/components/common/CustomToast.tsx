import React from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { CustomText, VectoreIcons } from './index';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  position?: 'top' | 'bottom';
}

export const showToast = ({ type, title, message, position = 'top' }: ToastProps) => {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    position: position,
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 60,
    bottomOffset: 40,
  });
};

// Custom toast component
const toastConfig = {
  success: ({ text1, text2 }: any) => {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <View style={styles.content}>
          <VectoreIcons
            icon="Ionicons"
            name="checkmark-circle"
            size={24}
            color="#FFFFFF"
          />
          <View style={styles.textContainer}>
            {text1 && (
              <CustomText style={styles.title}>
                {text1}
              </CustomText>
            )}
            {text2 && (
              <CustomText style={styles.message}>
                {text2}
              </CustomText>
            )}
          </View>
        </View>
      </View>
    );
  },
  error: ({ text1, text2 }: any) => {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <View style={styles.content}>
          <VectoreIcons
            icon="Ionicons"
            name="close-circle"
            size={24}
            color="#FFFFFF"
          />
          <View style={styles.textContainer}>
            {text1 && (
              <CustomText style={styles.title}>
                {text1}
              </CustomText>
            )}
            {text2 && (
              <CustomText style={styles.message}>
                {text2}
              </CustomText>
            )}
          </View>
        </View>
      </View>
    );
  },
  info: ({ text1, text2 }: any) => {
    return (
      <View style={[styles.container, styles.infoContainer]}>
        <View style={styles.content}>
          <VectoreIcons
            icon="Ionicons"
            name="information-circle"
            size={24}
            color="#FFFFFF"
          />
          <View style={styles.textContainer}>
            {text1 && (
              <CustomText style={styles.title}>
                {text1}
              </CustomText>
            )}
            {text2 && (
              <CustomText style={styles.message}>
                {text2}
              </CustomText>
            )}
          </View>
        </View>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    width: '90%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 60,
  },
  successContainer: {
    backgroundColor: '#4CAF50',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  errorContainer: {
    backgroundColor: '#F44336',
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
  },
  infoContainer: {
    backgroundColor: '#2196F3',
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 2,
    color: '#FFFFFF',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    color: '#FFFFFF',
  },
});

export default toastConfig;
