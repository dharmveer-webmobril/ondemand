import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withSequence,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedLogo = () => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);


    useEffect(() => {
        // Rotate first, then fade/scale
        rotation.value = withSequence(
            withTiming(360, { duration: 1500, easing: Easing.linear }),
            withTiming(0, { duration: 0 }) // reset if needed
        );

        // Delay opacity and scale animation
        setTimeout(() => {
            opacity.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) });
            scale.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) });
        }, 1500);
    }, []);


    // --- Center of 180x180 SVG = 90, 90 ---
    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
            ],
        };
    });


    const animatedPathStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value },
        { translateX: -20 },
        { translateY: 20 },
        ],
        transformOrigin: '90px 90px',
    }));

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: "red" }}>
            {/* Blue Circle Rotation */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: 180,
                        height: 180,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    animatedCircleStyle,
                ]}>
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ backgroundColor: "red", height: 180, width: 180, borderRadius: 90 }}
                    colors={[
                        '#009BFF',
                        '#066AB7',
                        '#011321',
                    ]}
                ></LinearGradient>

            </Animated.View>

            {/* White Path Scale + Fade */}
            <Animated.View
                style={[
                    {
                        width: 200,
                        height: 200,
                        position: 'absolute', // Ensure overlap
                    },
                    animatedPathStyle,
                ]}>
                <Svg width={210} height={210} viewBox="0 0 1024 1024">
                    <Path
                        d="M807.881 918.623L692.164 779.055C707.275 740.159 734.02 634.557 685.906 554.044C625.796 453.458 492.231 437.296 466.06 419.58C437.306 411.449 384.641 373.629 404.015 287.407C417.153 250.567 437.321 238.365 471.674 229.477C514.614 218.367 499.389 110.913 417.153 140.275C334.916 169.636 282.536 266.888 296.943 349.247C311.35 431.606 351.875 488.65 430.967 513.103C510.059 537.557 603.924 576.233 611.341 644.306C617.711 667.427 612.218 737.349 566.252 774.465C492.379 833.665 365.673 814.787 314.326 794.695C272.446 778.308 226.408 742.914 198.991 707.349C161.592 653.851 108.77 695.843 127.932 734.599C158.279 795.974 208.129 825.572 258.046 853.596C307.361 885.244 385.353 896.36 443.948 896.904C502.542 897.449 569.053 873.845 618.948 843.119L717.332 968.959C739.023 990.297 747.422 1002.13 765.38 1005.57C783.338 1009.01 798.046 1010.37 810.882 997.536C816.104 992.314 824.868 979.731 824.868 955.231C824.868 943.791 818.756 932.878 807.881 918.623Z"
                        fill="white"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
};

export default AnimatedLogo;