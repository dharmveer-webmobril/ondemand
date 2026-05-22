import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import RoutineAvailableBadge from './RoutineAvailableBadge';
import {
  isServiceRoutineEnabled,
  type ServiceRoutineConfig,
} from '@utils/serviceRoutineConfig';

type ServiceNameWithRoutineBadgeProps = {
  name: string;
  service?: { routineConfig?: ServiceRoutineConfig | null } | null;
  routineConfig?: ServiceRoutineConfig | null;
  numberOfLines?: number;
  nameStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  badgeStyle?: StyleProp<ViewStyle>;
  compactBadge?: boolean;
};

/**
 * Full-width service title with routine pill on its own row so long names wrap cleanly.
 */
export default function ServiceNameWithRoutineBadge({
  name,
  service,
  routineConfig,
  numberOfLines = 2,
  nameStyle,
  containerStyle,
  badgeStyle,
  compactBadge = true,
}: ServiceNameWithRoutineBadgeProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const showBadge = service
    ? isServiceRoutineEnabled(service)
    : isServiceRoutineEnabled({ routineConfig });

  return (
    <View style={[styles.container, containerStyle]}>
      <CustomText
        style={[styles.name, nameStyle]}
        numberOfLines={numberOfLines}
      >
        {name}
      </CustomText>
      {showBadge ? (
        <RoutineAvailableBadge
          service={service}
          routineConfig={routineConfig}
          compact={compactBadge}
          style={[styles.badge, badgeStyle]}
        />
      ) : null}
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { SH } = theme;
  return StyleSheet.create({
    container: {
      width: '100%',
      minWidth: 0,
      flexShrink: 1,
    },
    name: {
      width: '100%',
      flexShrink: 1,
    },
    badge: {
      marginTop: SH(6),
    },
  });
};
