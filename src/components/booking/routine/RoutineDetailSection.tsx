import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type RoutineDetailSectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function RoutineDetailSection({
  title,
  children,
}: RoutineDetailSectionProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <CustomText style={styles.title}>{title}</CustomText>
      {children}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    section: {
      gap: theme.SH(8),
    },
    title: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.text,
    },
  });
