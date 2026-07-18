import { StyleSheet, View } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { AnimatedEnter, AnimatedPressable, CustomText, VectoreIcons } from '@components/common';

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
  index?: number;
  icon?: {
    name: string;
    icon: IconType;
  };
}

export default function ProfileMenuItem({
  label,
  onPress,
  showArrow = true,
  index = 0,
  icon,
}: ProfileMenuItemProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AnimatedEnter index={index} variant="fade">
      <AnimatedPressable
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
          <View style={{ flex: 1 }}>
            <CustomText style={styles.labelText}>{label}</CustomText>
          </View>
        </View>
        {showArrow && (
          <VectoreIcons
            name="chevron-forward"
            size={theme.SF(20)}
            icon="Ionicons"
            color={theme.colors.lightText}
          />
        )}
      </AnimatedPressable>
    </AnimatedEnter>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    marginHorizontal: theme.SW(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.SW(12),
  },
  labelText: {
    fontSize: theme.SF(15),
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
  },
});
