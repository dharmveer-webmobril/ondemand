import React, { useMemo } from 'react';
import { View, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type RoutineDetailKeyValueRowProps = {
  label: string;
  value?: React.ReactNode;
  valueStyle?: StyleProp<TextStyle>;
  labelFlex?: number;
};

export default function RoutineDetailKeyValueRow({
  label,
  value,
  valueStyle,
  labelFlex = 1,
}: RoutineDetailKeyValueRowProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <CustomText style={[styles.label, { flex: labelFlex }]}>{label}</CustomText>
      {typeof value === 'string' || typeof value === 'number' ? (
        <CustomText style={[styles.value, valueStyle]}>{value}</CustomText>
      ) : (
        <View style={styles.valueWrap}>{value}</View>
      )}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.SW(12),
      paddingVertical: theme.SH(6),
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
    valueWrap: {
      alignItems: 'flex-end',
      maxWidth: '55%',
    },
    value: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.text,
      textAlign: 'right',
    },
  });
