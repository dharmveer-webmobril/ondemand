import { Platform, StyleSheet } from "react-native";
import { ThemeType } from "@utils/theme/ThemeContext";

const CustomTextInputStyles = (theme: ThemeType, isDisabled: boolean, inputTheme = '', withBackground = "transparent", multiline = false) => {
    const { colors, fonts, size, SF, fontSize, margins } = theme;
    return StyleSheet.create({
        container: {
            width: "100%",
        },
        // label: {
        //     fontSize: size.SF(14),
        //     fontFamily: fonts.Medium,
        //     marginBottom: size.SH(7),
        //     color: colors.text,
        // },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: inputTheme === 'white' ? theme.colors.white : colors.textInputBorder,
            borderRadius: size.SF(10),
            paddingHorizontal: size.SF(10),
            paddingVertical: margins.sm,
            backgroundColor: withBackground ? colors.white : "transparent",
            opacity: isDisabled ? 0.6 : 1,
        },
        inputContainerMultiline: {
            alignItems: "flex-start",
            minHeight: size.SH(120),
        },
        inputStyle: {
            flex: 1,
            paddingVertical: Platform.OS === "ios" ? SF(8) : SF(7.5),
            color: inputTheme === 'white' ? theme.colors.white : colors.text,
            fontSize: fontSize.sm,
            paddingLeft: SF(10),
            fontFamily: fonts.REGULAR,
            ...(multiline && {
                paddingTop: Platform.OS === "ios" ? SF(12) : SF(10),
                minHeight: size.SH(120),
            }),
        },
        iconStyle: {
            width: SF(20),
            height: SF(20),
            tintColor: inputTheme === 'white' ? theme.colors.white : colors.text
        },
        errorText: {
            marginLeft: margins.md,
            marginTop: margins.sm
        }
    });
};
export default CustomTextInputStyles