import { StyleSheet, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';

interface ProfileMenuItemProps {
  label: string;
  onPress: () => void;
  showArrow?: boolean;
}

export default function ProfileMenuItem({ label, onPress, showArrow = true }: ProfileMenuItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <CustomText style={styles.labelText}>{label}</CustomText>
      {showArrow && (
        <VectoreIcons
          name="chevron-forward"
          size={theme.SF(20)}
          icon="Ionicons"
          color={theme.colors.lightText}
        />
      )}
    </Pressable>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary ,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    marginHorizontal: theme.SW(20),
    marginBottom: theme.SH(12),
  },
  labelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
  },
});

