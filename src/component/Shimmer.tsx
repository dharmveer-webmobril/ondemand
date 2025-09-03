import React, { useEffect } from 'react'
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  DimensionValue,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

interface ShimmerProps {
  width?: DimensionValue
  height?: DimensionValue
  borderRadius?: number
  style?: StyleProp<ViewStyle>
  colors?: string[]
  duration?: number
  shimmerWidth?: number // width of the moving gradient band
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = 120,
  height = 20,
  borderRadius = 8,
  style,
  colors = ['#e0e0e0', '#f5f5f5', '#e0e0e0'],
  duration = 2500,
  shimmerWidth, // optional, if not passed we'll calculate below
}) => {
  const actualWidth = typeof width === 'number' ? width : 200 // fallback if width is % or undefined
  const gradientWidth = shimmerWidth ?? actualWidth * 0.6

  const translateX = useSharedValue(-gradientWidth)

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(actualWidth + gradientWidth, { duration }),
      -1, // infinite
      false
    )
  }, [duration, actualWidth, gradientWidth])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: '#e0e0e0',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            width: gradientWidth,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  )
}

export default React.memo(Shimmer)
