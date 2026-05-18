import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type BookAppointmentAccordionProps = {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'default' | 'info';
  children?: React.ReactNode;
};

export default function BookAppointmentAccordion({
  title,
  subtitle,
  expanded,
  onToggle,
  variant = 'default',
  children,
}: BookAppointmentAccordionProps) {
  const theme = useThemeContext();
  const styles = useMemo(
    () => createStyles(theme, variant),
    [theme, variant],
  );

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.headerText}>
          <CustomText style={styles.title}>{title}</CustomText>
          {subtitle && !expanded ? (
            <CustomText style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </CustomText>
          ) : null}
        </View>
        <VectoreIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          icon="Ionicons"
          size={theme.SF(22)}
          color={theme.colors.primary}
        />
      </Pressable>

      {expanded && children ? (
        <View style={styles.body}>{children}</View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ThemeType, variant: 'default' | 'info') =>
  StyleSheet.create({
    card: {
      backgroundColor: variant === 'info' ? '#E8F4FD' : theme.colors.white,
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: variant === 'info' ? '#B8DAF5' : theme.colors.gray || '#E8E8E8',
      padding: theme.SW(16),
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerText: {
      flex: 1,
      marginRight: theme.SW(8),
    },
    title: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      marginTop: theme.SH(4),
    },
    body: {
      marginTop: theme.SH(12),
    },
  });
