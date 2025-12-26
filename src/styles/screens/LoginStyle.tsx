import { StyleSheet } from "react-native";
import { ThemeType } from "@utils/theme/ThemeContext";

const LoginStyle = (theme: ThemeType) => {
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
            marginTop:theme.margins.xl
        },
        signupTextContainer: {
            alignItems: 'center',
            marginTop: SH(20),
        },
    });
};
export default LoginStyle