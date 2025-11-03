import React, { useMemo } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Platform,
    TextStyle,
    ViewStyle,
    TextInputProps,
    Image,
    ImageSourcePropType,
    DimensionValue,
    I18nManager
} from "react-native";
import { Colors, Fonts, SF, SH, SW } from "../utils";
import AppText from "./AppText";

interface InputFieldProps extends TextInputProps {
    label?: string;
    errorMessage?: string;
    leftIcon?: ImageSourcePropType;
    rightIcon?: ImageSourcePropType;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    errorStyle?: TextStyle;
    labelStyle?: TextStyle;
    isDisabled?: boolean;
    textColor?: string;
    color?: string;
    marginBottom?: DimensionValue,
    marginTop?: DimensionValue,
    inputContainer?: ViewStyle;
    withBackground?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label = "",
    placeholder = "",
    value = "",
    onChangeText,
    onBlur,
    onFocus,
    keyboardType = "default",
    secureTextEntry = false,
    errorMessage = "",
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle = {},
    inputStyle = {},
    labelStyle = {},
    errorStyle = {},
    multiline = false,
    maxLength,
    isDisabled = false,
    autoFocus = false,
    placeholderTextColor = Colors.white,
    textColor = Colors.white,
    color = Colors.white,
    marginBottom = SH(10),
    marginTop = SH(10),
    inputContainer,
    withBackground = false,
    ...props
}) => {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    width: "100%",
                    marginVertical: 5,
                    marginBottom,
                    marginTop,
                    ...containerStyle,
                },
                label: {
                    fontSize: SF(14),
                    fontFamily: Fonts.MEDIUM,
                    marginBottom: SH(10),
                    color: color,
                    ...labelStyle
                },
                inputContainer: {
                    flexDirection: "row",
                    alignItems: multiline ? "flex-start" : "center",
                    borderWidth: 1,
                    borderColor: color,
                    borderRadius: SF(10),
                    paddingHorizontal: SF(10),
                    // paddingVertical: SF(3),
                    backgroundColor: withBackground ? "#fff" : "transparent",
                    ...inputContainer
                },
                input: {
                    flex: 1,
                    paddingVertical: Platform.OS === "ios" ? SF(10) : SF(8),
                    color: textColor,
                    fontSize: SF(14.5),
                    paddingLeft: SF(10),
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    fontFamily: Fonts.REGULAR,
                    ...inputStyle,
                },
                errorText: {
                    marginTop: 3,
                    color: Colors.red,
                    fontSize: SF(12),
                    fontFamily: Fonts.REGULAR,
                    paddingLeft: SW(4),
                    ...errorStyle,
                },
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [containerStyle, inputStyle, errorStyle, errorMessage]
    );

    return (
        <View style={styles.container}>
            {label ? <AppText style={styles.label}>{label}</AppText> : null}
            <View style={styles.inputContainer}>
                {leftIcon && <View style={{ paddingHorizontal: SF(2) }}>
                    <Image
                        source={leftIcon}
                        style={{ width: SF(20), height: SF(20), tintColor: color }}
                        resizeMode="contain"
                    />
                </View>}
                <TextInput
                    allowFontScaling={false}
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    onChangeText={onChangeText}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoFocus={autoFocus}
                    multiline={multiline}
                    maxLength={maxLength}
                    value={value}
                    editable={!isDisabled}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress}>
                        <Image
                            source={rightIcon}
                            style={{ width: SF(20), height: SF(20), tintColor: color }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {errorMessage ? <AppText style={styles.errorText}>{errorMessage}</AppText> : null}
        </View>
    );
};

export default InputField;
