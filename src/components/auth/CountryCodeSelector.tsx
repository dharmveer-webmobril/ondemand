import {  StyleSheet, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';

interface CountryCodeSelectorProps {
  countryCode: string;
  onPress: () => void;
}

export default function CountryCodeSelector({ countryCode, onPress }: CountryCodeSelectorProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <CustomText style={styles.countryCodeText}>{countryCode}</CustomText>
      <VectoreIcons
        icon="Ionicons"
        name="chevron-down"
        size={theme.SF(16)}
        color={theme.colors.white}
      />
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.SW(12),
      paddingVertical: theme.SH(10),
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.white,
      minWidth: theme.SW(70),
      gap: theme.SW(5),
    },
    countryCodeText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.white,
      fontFamily: theme.fonts.MEDIUM,
    },
  });
