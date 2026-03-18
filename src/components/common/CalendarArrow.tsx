import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type Direction = 'left' | 'right';

export interface CalendarArrowProps {
  direction: Direction;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * Arrow drawn with View borders (no icon font).
 * Works on devices where Ionicons fail (e.g. Xiaomi).
 */
export default function CalendarArrow({
  direction,
  color = '#009BFF',
  size = 26,
  style,
}: CalendarArrowProps) {
  const half = size / 2;
  const arrowWidth = Math.round(size * 0.45);

  const leftArrowStyle = {
    width: 0,
    height: 0,
    borderTopWidth: half,
    borderBottomWidth: half,
    borderRightWidth: arrowWidth,
    borderTopColor: 'transparent' as const,
    borderBottomColor: 'transparent' as const,
    borderRightColor: color,
  };

  const rightArrowStyle = {
    width: 0,
    height: 0,
    borderTopWidth: half,
    borderBottomWidth: half,
    borderLeftWidth: arrowWidth,
    borderTopColor: 'transparent' as const,
    borderBottomColor: 'transparent' as const,
    borderLeftColor: color,
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]} pointerEvents="none">
      <View style={direction === 'left' ? leftArrowStyle : rightArrowStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
