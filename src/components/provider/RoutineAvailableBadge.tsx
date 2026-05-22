import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import {
  isServiceRoutineEnabled,
  type ServiceRoutineConfig,
} from '@utils/serviceRoutineConfig';

type RoutineAvailableBadgeProps = {
  service?: { routineConfig?: ServiceRoutineConfig | null } | null;
  routineConfig?: ServiceRoutineConfig | null;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function RoutineAvailableBadge({
  service,
  routineConfig,
  compact = false,
  style,
}: RoutineAvailableBadgeProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(theme, compact),
    [theme, compact],
  );

  const enabled = service
    ? isServiceRoutineEnabled(service)
    : isServiceRoutineEnabled({ routineConfig });

  if (!enabled) {
    return null;
  }

  return (
    <View style={[styles.badge, style]} accessibilityRole="text">
      <CustomText style={styles.badgeText}>
        {t('bookAppointment.routineAvailableBadge')}
      </CustomText>
    </View>
  );
}

const createStyles = (theme: ThemeType, compact: boolean) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      flexShrink: 0,
      maxWidth: '100%',
      backgroundColor: Colors.secondary || '#E8F4FC',
      borderWidth: 1,
      borderColor: Colors.primary || '#135D96',
      paddingHorizontal: compact ? SW(7) : SW(9),
      paddingVertical: compact ? SH(3) : SH(4),
      borderRadius: SF(6),
    },
    badgeText: {
      fontSize: compact ? SF(10) : SF(11),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary || '#135D96',
      letterSpacing: 0.2,
    },
  });
};
