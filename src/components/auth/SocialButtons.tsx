import { SH, SW } from "@utils/dimensions";
import { useThemeContext } from "@utils/theme";
import { useMemo } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

const SocialButton = ({
    icon,
    onPress,
    width = SW(40),
    iconSize = SH(26),
    height = SW(40),
}: {
    icon: any;
    onPress: () => void;
    width?: number;
    height?: number;
    iconSize?: number;
}) => {
    const theme = useThemeContext();
    const styles = useMemo(() =>
        StyleSheet.create({
            socialButton: {
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: SW(10),
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
            },
        })
        , [])
    return <TouchableOpacity
        activeOpacity={0.5}
        style={[styles.socialButton, { width, height }]}
        onPress={onPress}>
        <Image
            source={icon}
            style={{ width: iconSize, height: iconSize, resizeMode: 'contain' }}
        />
    </TouchableOpacity>
}

export default SocialButton