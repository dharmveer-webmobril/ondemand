import { View, Text, TextInput, ImageSourcePropType, KeyboardTypeOptions, TextInputProps, Image, Pressable, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useThemeContext } from '@utils/theme';
import { CustomInputStyle } from '@styles/index';

interface CustomTextInputProps extends TextInputProps {
    label?: string;
    leftIcon?: ImageSourcePropType;
    rightIcon?: ImageSourcePropType;
    onRightIconPress?: () => void;
    isEditable?: boolean,
    errortext?: string,
    keyboardType?: KeyboardTypeOptions,
    maxLength?: number | undefined;
    marginTop?: number | undefined;
    withBackground?: string;
    inputTheme?: string;
}

export default function CustomTextInput({ placeholder = '', secureTextEntry = false, value, onChangeText, leftIcon, rightIcon, onRightIconPress=()=>{}, isEditable = true, errortext, keyboardType = "default", maxLength, withBackground = '', inputTheme = '', marginTop = 0 }: CustomTextInputProps) {
    const theme = useThemeContext();
    const styles = CustomInputStyle(theme, false, inputTheme, withBackground);
    return (
        <View style={[styles.container, { marginTop }]}>
            <View style={styles.inputContainer}>
                {leftIcon && (
                    <Image
                        source={leftIcon}
                        style={styles.iconStyle}
                        resizeMode="contain"
                    />
                )}
                <TextInput
                    style={styles.inputStyle}
                    placeholderTextColor={inputTheme == 'white' ? theme.colors.white : theme.colors.placeholder}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    onChangeText={onChangeText}
                    value={value}
                    secureTextEntry={secureTextEntry}
                    editable={isEditable}
                />
                {rightIcon && (
                    <Pressable
                        onPress={() => { onRightIconPress() }}
                    >
                        <Image
                            source={rightIcon}
                            style={styles.iconStyle}
                            resizeMode="contain"
                        />
                    </Pressable>
                )}
            </View>
        </View>
    )
}