import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { ThemeType, useThemeContext } from '@utils/theme';
import { formatDistanceKmAway } from '@utils/tools';
import CustomText from './CustomText';
import VectoreIcons from './VectoreIcons';

type DistanceLabelProps = {
  distanceKm?: number | null;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconSize?: number;
  iconColor?: string;
};

export default function DistanceLabel({
  distanceKm,
  style,
  textStyle,
  iconSize,
  iconColor,
}: DistanceLabelProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const label = formatDistanceKmAway(distanceKm);

  if (!label) {
    return null;
  }

  const size = iconSize ?? theme.SF(14);
  const color = iconColor ?? (theme.colors.lightText || '#888');

  return (
    <View style={[styles.row, style]}>
      <VectoreIcons
        name="navigate-outline"
        icon="Ionicons"
        size={size}
        color={color}
      />
      <CustomText style={[styles.text, textStyle]} numberOfLines={1}>
        {label}
      </CustomText>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SF, fonts: Fonts, SW } = theme;
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(4),
    },
    text: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: theme.colors.lightText || '#666',
      flexShrink: 1,
    },
  });
};
