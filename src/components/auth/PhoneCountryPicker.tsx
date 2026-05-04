import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {
  CountryPicker,
  type CountryItem,
} from 'react-native-country-codes-picker';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomInput, CustomText, VectoreIcons } from '@components/common';
import imagePaths from '@assets';

export type PhoneCountryPickerSelection = {
  dialCode: string;
  countryIso2: string;
};

export interface PhoneCountryPickerProps {
  dialCode: string;
  nationalNumber: string;
  onSelectionChange: (next: PhoneCountryPickerSelection) => void;
  onNationalNumberChange: (digits: string) => void;
  phonePlaceholder?: string;
  errorText?: string;
  marginTop?: number;
  onNationalBlur?: () => void;
}

export default function PhoneCountryPicker({
  dialCode,
  nationalNumber,
  onSelectionChange,
  onNationalNumberChange,
  phonePlaceholder,
  errorText,
  marginTop = 0,
  onNationalBlur,
}: PhoneCountryPickerProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const pickerStyles = useMemo(
    () =>
      ({
        modal: {
          height: '65%',
          backgroundColor: theme.colors.white,
        } as ViewStyle,
        textInput: {
          height: theme.SH(48),
          borderRadius: theme.borderRadius.sm,
          color: theme.colors.text,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.secondary || '#E0E0E0',
          paddingHorizontal: theme.SW(12),
        } as TextStyle,
        countryButtonStyles: {
          height: theme.SH(50),
        } as ViewStyle,
        dialCode: {
          color: theme.colors.text,
          fontFamily: theme.fonts.MEDIUM,
        } as TextStyle,
        countryName: {
          color: theme.colors.text,
          fontFamily: theme.fonts.REGULAR,
        } as TextStyle,
        searchMessageText: {
          color: theme.colors.placeholder,
        } as TextStyle,
      }) as const,
    [theme],
  );

  const handlePickCountry = useCallback(
    (item: CountryItem) => {
      onSelectionChange({
        dialCode: item.dial_code,
        countryIso2: item.code.toLowerCase(),
      });
      closePicker();
    },
    [closePicker, onSelectionChange],
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      onNationalNumberChange(text.replace(/\D/g, ''));
    },
    [onNationalNumberChange],
  );

  return (
    <View style={{ marginTop }}>
      <View style={styles.row}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={[
            styles.dialTrigger,
            Platform.OS === 'ios' &&
              (Platform as { OS: string; isPad?: boolean }).isPad &&
              styles.dialTriggerPad,
          ]}
        >
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.MEDIUM}
            color={theme.colors.white}
          >
            {dialCode}
          </CustomText>
          <VectoreIcons
            icon="Ionicons"
            name="chevron-down"
            size={theme.SF(16)}
            color={theme.colors.white}
          />
        </Pressable>
        <View style={styles.phoneWrap}>
          <CustomInput
            leftIcon={imagePaths.mobile_icon}
            placeholder={phonePlaceholder}
            inputTheme="white"
            value={nationalNumber}
            onChangeText={handlePhoneChange}
            onBlur={onNationalBlur}
            keyboardType="number-pad"
            marginTop={0}
            maxLength={15}
          />
        </View>
      </View>
      {errorText ? (
        <CustomText
          fontSize={theme.fontSize.xxs}
          color={theme.colors.errorText}
          marginTop={theme.SH(5)}
          marginLeft={theme.SW(5)}
        >
          {errorText}
        </CustomText>
      ) : null}

      <CountryPicker
        show={pickerOpen}
        lang="en"
        inputPlaceholder="Search country"
        inputPlaceholderTextColor={theme.colors.placeholder}
        searchMessage="No country found"
        onRequestClose={closePicker}
        pickerButtonOnPress={handlePickCountry}
        style={pickerStyles}
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
    },
    dialTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: theme.SW(88),
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(10),
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.white,
      gap: theme.SW(4),
    },
    dialTriggerPad: {
      marginLeft: theme.SW(50),
    },
    phoneWrap: {
      flex: 1,
    },
  });
