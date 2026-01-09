import { useThemeContext } from '@utils/theme';
import React, { useMemo } from 'react';
import {
    Pressable,
    ActivityIndicator,
    StyleSheet,
    StyleProp,
    TextStyle,
    ViewStyle,
    View,
} from 'react-native';
import CustomText from './CustomText';

type CustomButtonProps = {
    title?: string;
    onPress?: () => void;
    isLoading?: boolean;
    buttonStyle?: StyleProp<ViewStyle>;
    disable?: boolean;
    buttonTextStyle?: TextStyle;
    icon?: React.ReactNode;
    spacedImages?: boolean;
    linearGradientProps?: object;
    textColor?: string;
    isExtraBoxShadow?: boolean;
    isBordered?: boolean;
    paddingHorizontal?: any;
    backgroundColor?: string;
    marginTop?: any;
    marginBottom?: any;
};

const CustomButton: React.FC<CustomButtonProps> = ({
    title = '',
    onPress = () => { },
    isLoading = false,
    buttonStyle = {},
    disable = false,
    icon,
    spacedImages = false,
    textColor = '#ffffff',
    backgroundColor = '',
    paddingHorizontal = '',
    marginTop = 0,
    marginBottom = 0,
    buttonTextStyle = {},
}) => {
    const isButtonDisabled = isLoading;
    const theme = useThemeContext();
    const styles = useMemo(
        () =>
            StyleSheet.create({
                buttonStyle: {
                    backgroundColor: backgroundColor,
                    height: theme.SF(42),
                    ...(paddingHorizontal ? { paddingHorizontal } : { width: '100%' }),
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                },
                buttonTextStyle: {
                    color: textColor || theme.colors.whitetext,
                    fontFamily: theme.fonts.SEMI_BOLD,
                    fontSize: theme.SF(18),

                },
                buttonViewStyle: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: spacedImages ? 'space-around' : 'center',
                    ...(paddingHorizontal ? { paddingHorizontal } : { width: '100%' }),
                },
                LeftImageViewStyle: {
                    marginVertical: theme.SW(5),
                },
            }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [disable, spacedImages, textColor, backgroundColor, paddingHorizontal, theme],
    );

    return (
        <Pressable
            onPress={!isButtonDisabled ? onPress : undefined}
            style={({ pressed }) => [
                styles.buttonStyle,
                { marginTop, marginBottom },
                { backgroundColor: backgroundColor || theme.colors.primary },
                pressed && !isButtonDisabled && { opacity: 0.8 },
                buttonStyle,
            ]}
            disabled={isButtonDisabled}
        >
            {isLoading ? (
                <ActivityIndicator
                    size="small"
                    color={textColor || theme.colors.primary}
                />
            ) : (
                <View style={styles.buttonViewStyle}>
                    {icon && <View style={styles.LeftImageViewStyle}>{icon}</View>}
                    <CustomText variant='h4' color={textColor || theme.colors.whitetext} style={buttonTextStyle}>
                        {title}
                    </CustomText>
                </View>
            )}
        </Pressable>
    );
};

export default CustomButton;
