import { useThemeContext } from '@utils/theme';
import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    StyleProp,
    TextStyle,
    ViewStyle,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import {
    PRESS_DURATION_MS,
    PRESS_EASING,
    PRESS_SCALE,
    RELEASE_DURATION_MS,
} from '@utils/animations';
import CustomText from './CustomText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    const isButtonDisabled = isLoading || disable;
    const theme = useThemeContext();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        if (!isButtonDisabled) {
            scale.value = withTiming(PRESS_SCALE, {
                duration: PRESS_DURATION_MS,
                easing: PRESS_EASING,
            });
        }
    }, [isButtonDisabled, scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withTiming(1, {
            duration: RELEASE_DURATION_MS,
            easing: PRESS_EASING,
        });
    }, [scale]);

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
        <AnimatedPressable
            onPress={!isButtonDisabled ? onPress : undefined}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isButtonDisabled}
            style={[
                styles.buttonStyle,
                { marginTop, marginBottom },
                { backgroundColor: backgroundColor || theme.colors.primary },
                isButtonDisabled && { opacity: 0.75 },
                buttonStyle,
                animatedStyle,
            ]}
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
        </AnimatedPressable>
    );
};

export default CustomButton;
