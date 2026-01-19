import { StyleSheet, Pressable, View } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';

type IconType =
  | 'Feather'
  | 'AntDesign'
  | 'Fontisto'
  | 'MaterialCommunityIcons'
  | 'FontAwesome'
  | 'EvilIcons'
  | 'Entypo'
  | 'Ionicons'
  | 'Octicons'
  | 'FontAwesome5'
  | 'MaterialIcons'
  | 'FontAwesome6';

interface ProfileMenuItemProps {
  label: string;
  onPress: () => void;
  showArrow?: boolean;
  icon?: {
    name: string;
    icon: IconType;
  };
}

export default function ProfileMenuItem({ label, onPress, showArrow = true, icon }: ProfileMenuItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        {icon && (
          <VectoreIcons
            name={icon.name}
            size={theme.SF(22)}
            icon={icon.icon}
            color={theme.colors.primary || '#135D96'}
          />
        )}
        <CustomText style={styles.labelText}>{label}</CustomText>
      </View>
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
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // backgroundColor: theme.colors.secondary ,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    marginHorizontal: theme.SW(20),
    // marginBottom: theme.SH(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    // borderRadius: theme.borderRadius.md,
    // paddingHorizontal: theme.SW(20),
    // paddingVertical: theme.SH(16),
    marginBottom: theme.SH(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.SW(12),
  },
  labelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
  },
});

