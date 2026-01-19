import { Dimensions } from "react-native";

export const BOTTOM_TAB_HEIGHT = 80
export const screenHeight = Dimensions.get('screen').height
export const screenWidth = Dimensions.get('screen').width
export const isBannerHeight = screenHeight * 0.4

export const Colors = {
    primary: '#135D96',
    primary_light: '#009BFF',
    secondary: '#EEF6F9',
    tertiary: '#EAEAEA',
    background: "#f7f7f7",
    border: '#3D3D3D',
    headingColor: '#404040',
    lightText: '#999999',
    white: "#ffffff",
    text: '#404040',
    whitetext: '#ffffff',
    errorText: '#f50000',
    red: '#f50000',
    black: '#000000',
    textInputBorder: '#3D3D3D',
    lightInputBorder: '#FFFFFF80',
    placeholder: '#7F7F7F',
    gradientColor: [
        '#009BFF', '#066AB7', '#011321'
    ],
    textWhite:'#ffffff',
    gray: '#D9D9D9',
    textAppColor: '#404040',
    warningColor: '#FAAC00',
}

export enum Fonts {
    BOLD= "Inter-Bold",//700
    EXTRA_BOLD= "Inter-ExtraBold",//800
    LIGHT= "Inter-Light",//300
    MEDIUM= "Inter-Medium",//500
    REGULAR= "Inter-Regular",//400
    SEMI_BOLD= 'Inter-SemiBold',//600

    PlusJakartaSans_Bold= "PlusJakartaSans-Bold",
    PlusJakartaSans_EXTRA_BOLD= "PlusJakartaSans-ExtraBold",
    PlusJakartaSans_LIGHT= "PlusJakartaSans-Light",
    PlusJakartaSans_MEDIUM= "PlusJakartaSans-Medium",
    PlusJakartaSans_REGULAR= "PlusJakartaSans-Regular",
    PlusJakartaSans_SEMI_BOLD= 'PlusJakartaSans-SemiBold',

    Chivo_Bold= "Chivo-Bold",
    Chivo_Regular= "Chivo-Regular",
    Chivo_Medium= "Chivo-Medium",
    Chivo_SemiBold= "Chivo-SemiBold",
}

