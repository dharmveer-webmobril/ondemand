import { View, TextInput, ImageSourcePropType, KeyboardTypeOptions, TextInputProps, Image, Pressable } from 'react-native'
import React, { forwardRef } from 'react'
import { useThemeContext } from '@utils/theme';
import { CustomInputStyle } from '@styles/index';
import CustomText from './CustomText';

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
    transparentBackground?: boolean;
    inputStyle?: TextInputProps;
}

const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(({ placeholder = '', secureTextEntry = false, value, onChangeText, leftIcon, rightIcon, onRightIconPress = () => { }, isEditable = true, errortext: _errortext, keyboardType = "default", maxLength, withBackground = '', inputTheme = '', marginTop = 0, transparentBackground = false, multiline }, ref) => {
    const theme = useThemeContext();
    const styles = CustomInputStyle(theme, false, inputTheme, transparentBackground ? '' : withBackground, multiline);
    let localMaxLength:any = 70;
    if (multiline) {
        localMaxLength = undefined;
    }
    if (maxLength) {
        localMaxLength = maxLength;
    }
    return (
        <View style={[styles.container, { marginTop }]}>
            <View style={[styles.inputContainer, multiline && styles.inputContainerMultiline]}>
                {leftIcon && (
                    <Image
                        source={leftIcon}
                        style={styles.iconStyle}
                        resizeMode="contain"
                    />
                )}
                <TextInput
                    ref={ref}
                    style={[styles.inputStyle]}
                    placeholderTextColor={inputTheme === 'white' ? theme.colors.white : theme.colors.placeholder}
                    placeholder={placeholder}
                    maxLength={localMaxLength}
                    keyboardType={keyboardType}
                    onChangeText={onChangeText}
                    value={value}
                    secureTextEntry={secureTextEntry}
                    editable={isEditable}
                    multiline={multiline}
                    autoCapitalize={keyboardType==='email-address' ? 'none' : 'sentences'}
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
            {_errortext && <CustomText color={theme.colors.errorText} fontSize={theme.fontSize.xxs} fontFamily={theme.fonts.REGULAR} marginTop={5}>{_errortext}</CustomText>}
        </View>
    )
});

CustomTextInput.displayName = 'CustomTextInput';

export default CustomTextInput;