// src/components/ToastService.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors, Fonts, SF, SH, SW, boxShadow } from '../utils';
import AppText from './AppText';

type ToastType = 'success' | 'error' | 'info' | 'exit';

type CustomToastProps = {
  text1: string;
  text2: string;
  props: {
    customOnPress?: () => void;
  };
};

const ToastBox = ({ text1, text2, type, props }: CustomToastProps & { type: ToastType }) => {
  const { customOnPress } = props;

  const colorMap = {
    exit: 'green',
    success: 'green',
    error: 'red',
    info: '#ffc107',
  };

  return (
    <View style={[styles.toastContainer, { borderLeftColor: colorMap[type] }, boxShadow]}>
      <AppText style={styles.textTitle}>{text1}</AppText>
      <AppText style={styles.textMessage}>{text2}</AppText>
      {customOnPress && (
        <TouchableOpacity onPress={customOnPress}>
          <AppText style={styles.okButton}>OK</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const toastConfig = {
  success: ({ text1, text2, props }: any) => (
    <ToastBox text1={text1} text2={text2} props={props} type="success" />
  ),
  error: ({ text1, text2, props }: any) => (
    <ToastBox text1={text1} text2={text2} props={props} type="error" />
  ),
  info: ({ text1, text2, props }: any) => (
    <ToastBox text1={text1} text2={text2} props={props} type="info" />
  ),
  exit: ({ text1 }: any) => (
    <View style={styles.exitToast}>
      <Text style={styles.exitText} allowFontScaling={false}>{text1}</Text>
    </View>
  ),
};

export const showAppToast = ({
  title,
  message,
  type = 'info',
  timeout = 4000,
  onOkPress,
  position = 'top',
}: {
  title: string;
  message: string;
  type?: ToastType;
  timeout?: number;
  onOkPress?: () => void;
  position?: 'top' | 'bottom';
}) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: timeout,
    autoHide: !onOkPress,
    position,
    props: {
      customOnPress: onOkPress,
    },
  });
};

export const ToastService = () => <Toast config={toastConfig} />;

const styles = StyleSheet.create({
  toastContainer: {
    paddingVertical: SH(10),
    paddingHorizontal: SW(12),
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderLeftWidth: 5,
    borderRadius: 8,
    marginHorizontal: SW(10),
    marginVertical: SH(6),
    width: '90%',
  },
  textTitle: {
    color: Colors.black,
    fontSize: SF(14),
    fontFamily: Fonts.PlusJakartaSans_EXTRA_BOLD,
  },
  textMessage: {
    color: Colors.textAppColor,
    fontSize: SF(12),
    fontFamily: Fonts.PlusJakartaSans_MEDIUM,
  },
  okButton: {
    color: Colors.themeColor,
    marginTop: SH(5),
    fontSize: SF(12),
    fontFamily: Fonts.MEDIUM,
  },
  exitToast: {
    minHeight: SH(30),
    minWidth: SW(120),
    backgroundColor: '#000',
    paddingVertical: SH(4),
    paddingHorizontal: SW(10),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  exitText: {
    color: '#fff',
    fontSize: SF(12),
  },
});
