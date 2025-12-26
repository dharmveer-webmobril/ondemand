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
    });
};
export default SignupStyle