import React, { useMemo } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    Text,
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
import { FormikErrors } from "formik";
import AppText from "./AppText";

interface InputFieldProps extends TextInputProps {
    label?: string;
    errorMessage?: any;
    leftIcon?: ImageSourcePropType;
    rightIcon?: ImageSourcePropType;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    errorStyle?: TextStyle;
    isDisabled?: boolean;
    textColor?: string;
    color?: string;
    marginBottom?: DimensionValue,
    marginTop?: DimensionValue,
    inputContainer?: ViewStyle;
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
    errorStyle = {},
    multiline = false,
    maxLength,
    isDisabled = false,
    autoFocus = false,
    placeholderTextColor = Colors.white,
    textColor = Colors.white,
    color = Colors.white,
    marginBottom = SH(10),
    marginTop = SF(5),
    inputContainer,
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
                },
                inputContainer: {
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: color,
                    borderRadius: SF(10),

                    paddingHorizontal: 10,
                    // paddingVertical: SH(3.6),
                    backgroundColor: isDisabled ? "#f2f2f2" : "transparent",
                    ...inputContainer
                },
                input: {
                    flex: 1,
                    paddingVertical: Platform.OS === "ios" ? SF(10) : SF(8),
                    color: textColor,
                    fontSize: SF(14),
                    paddingHorizontal: SF(10),
                    height: SF(42),
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
        [containerStyle, inputStyle, errorStyle, errorMessage]
    );

    return (
        <View style={styles.container}>
            {label ? <AppText style={styles.label}>{label}</AppText> : null}
            <View style={styles.inputContainer}>
                {leftIcon && <View style={{ paddingHorizontal: SF(2) }}>
                    <Image
                        source={leftIcon}
                        style={{ width: SF(18), height: SF(18), tintColor: color }}
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
                    <TouchableOpacity onPress={onRightIconPress} style={{ paddingHorizontal: SF(2) }}>
                        <Image
                            source={rightIcon}
                            style={{ width: SF(18), height: SF(18), tintColor: color }}
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
