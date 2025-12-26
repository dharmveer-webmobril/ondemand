import React, { FC } from 'react';
import { Text, TextStyle, Platform, StyleSheet, GestureResponderEvent } from 'react-native';
import { Colors, Fonts } from '@utils/theme/constants';
import { SF } from '@utils/dimensions';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
type PlatformType = 'ios' | 'android';

const fontSizeMap: Record<Variant, Record<PlatformType, number>> = {
    h1: { android: 24, ios: 22 },
    h2: { android: 22, ios: 20 },
    h3: { android: 20, ios: 18 },
    h4: { android: 18, ios: 16 },
    h5: { android: 16, ios: 14 },
    h6: { android: 12, ios: 10 },
    h7: { android: 10, ios: 9 },
};

interface CustomTextProps {
    variant?: Variant;
    fontFamily?: Fonts;
    fontSize?: number;
    color?: string;
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
    numberOfLines?: number;
    onPress?: (event: GestureResponderEvent) => void;
    marginTop?: number;
    textAlign?: 'left' | 'center' | 'right';
}

const CustomText: FC<CustomTextProps> = ({
    variant,
    fontFamily = Fonts.Chivo_Regular,
    fontSize,
    color,
    style,
    children,
    numberOfLines,
    marginTop = 0,
    textAlign = 'left',
    onPress,
    ...props
}) => {

    let computedFontSize: number = Platform.OS === 'android' ? SF(fontSize || 12) : SF(fontSize || 10);

    if (variant && fontSizeMap[variant]) {
        const defaultSize = fontSizeMap[variant][Platform.OS as PlatformType];
        computedFontSize = SF(fontSize || defaultSize);
    }

    return (
        <Text
            {...(onPress ? { onPress } : {})}   // <-- Only added when passed
            numberOfLines={numberOfLines}
            style={[
                styles.text,
                {
                    color: color || Colors.text,
                    fontSize: computedFontSize,
                    marginTop,
                    textAlign,
                    fontFamily
                },
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

export default CustomText;

const styles = StyleSheet.create({
    text: {
        textAlign: 'left'
    }
});
