import { StyleSheet } from "react-native";
import { ThemeType } from "@utils/theme/ThemeContext";

const SignupStyle = (theme: ThemeType) => {
    const { SH } = theme;
    return StyleSheet.create({
        container: {
            width: "100%",
        },
        forgotPassTxt: {
            textAlign: "right", marginTop: SH(15)
        },
        socialIconContainer: {
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'space-between',
            marginTop: theme.margins.xl
        },
        checkBoxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginTop:SH(15)
        },
        checkboxMargin: {
            marginRight: 10,
        },
        contentContainer: {
            flexGrow: 1,
        },
        contactContainer: {
            flexDirection: 'row',
            gap: theme.SW(10),
            marginTop: theme.SH(15),
        },
        countryCodeContainer: {
            width: theme.SW(90),
        },
        phoneInputContainer: {
            flex: 1,
        },
        acceptTermsText: {
            paddingRight: 10,
            paddingLeft: 5,
            lineHeight: 20,
        },
        addressSearchSection: {
            marginTop: SH(15),
            zIndex: 20,
        },
        autocompleteContainer: {
            flex: 0,
            zIndex: 99,
        },
        placesInput: {
            borderColor: theme.colors.textInputBorder || '#3D3D3D',
            borderWidth: 1,
            borderRadius: theme.borderRadius?.md ?? 8,
            paddingHorizontal: theme.SW(12),
            paddingVertical: theme.SH(10),
            color: theme.colors.text,
            fontSize: theme.fontSize.sm,
        },
        placesList: {
            backgroundColor: theme.colors.white,
            position: 'absolute' as const,
            zIndex: 999,
            width: '100%' as const,
            top: SH(52),
            maxHeight: SH(200),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            borderRadius: theme.borderRadius?.sm ?? 4,
        },
        addressPreview: {
            marginTop: SH(8),
            fontSize: theme.fontSize.xs,
            color: theme.colors.lightText || '#999',
        },
        /** Full-width address row (matches other auth inputs on gradient) */
        addressFieldContainer: {
            marginTop: SH(15),
            width: '100%',
        },
        addressPicker: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: SH(48),
            paddingVertical: SH(12),
            paddingHorizontal: theme.SW(12),
            borderWidth: 1,
            borderColor: theme.colors.white,
            borderRadius: theme.borderRadius?.md ?? 8,
            backgroundColor: 'transparent',
        },
        addressPickerPressed: {
            opacity: 0.88,
        },
        addressRowLabel: {
            opacity: 0.75,
        },
        addressRowValue: {
            opacity: 1,
        },
        addressIconLeft: {
            marginRight: theme.SW(10),
        },
        addressTextMiddle: {
            flex: 1,
            minWidth: 0,
            paddingRight: theme.SW(6),
        },
        addressIconChevron: {
            marginLeft: theme.SW(4),
        },
        addressErrorContainer: {
            marginTop: SH(5),
            marginLeft: theme.SW(5),
        },
        addressErrorText: {
            fontSize: theme.fontSize.xxs,
            color: theme.colors.errorText || '#FF0000',
        },
    });
};
export default SignupStyle