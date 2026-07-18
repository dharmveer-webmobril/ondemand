// components/AppHeader.tsx
import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { useThemeContext } from '@utils/theme';
import AnimatedPressable from './AnimatedPressable';
import CustomText from './CustomText';
import VectoreIcons from './VectoreIcons';

type AppHeaderProps = {
  title?: string;
  onLeftPress?: () => void;
  leftIconName?: string;
  leftIconFamily?: 'FontAwesome' | 'Ionicons' | 'Entypo' | 'MaterialIcons';
  rightIconName?: string | false;
  rightIconFamily?: 'Entypo' | 'Ionicons' | 'FontAwesome';
  onRightPress?: () => void;
  backgroundColor?: string;
  tintColor?: string;
  titleStyle?: any;
  containerStyle?: ViewStyle;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title = '',
  onLeftPress,
  leftIconName = 'angle-left',
  leftIconFamily = 'FontAwesome',
  rightIconName = false,
  rightIconFamily = 'Entypo',
  onRightPress = () => { },
  backgroundColor = 'transparent',
  tintColor,
  titleStyle,
  containerStyle = {},
}) => {
  const theme = useThemeContext();
  const hasLeft = !!onLeftPress;
  const hasRight = !!rightIconName;
  const { colors: Colors, fonts } = theme
  const bgColor = backgroundColor || Colors.background;
  const iconColor = tintColor || Colors.text;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          height: Platform.OS === 'ios' ? 48 : 56,
          backgroundColor: bgColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

        },
        leftside: {
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '15%',
        },
        rightside: {
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: '15%',
        },
        iconButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: 'center',
          alignItems: 'flex-end',
        },
        iconButtonleft: {
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: 'center',
          alignItems: 'flex-start',
          marginLeft:2
        },
        titleWrapper: {
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          width: '68%',
        },
        title: {
          fontFamily: fonts.SEMI_BOLD,
          fontSize: theme.SF(16),
          color: iconColor,
          letterSpacing: 0.2,
        },
      }),
    [bgColor, iconColor, theme, fonts.SEMI_BOLD],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left Icon */}
      <View style={styles.leftside}>
        {hasLeft && (
          <AnimatedPressable
            onPress={onLeftPress}
            style={styles.iconButtonleft}
          >
            <VectoreIcons
              icon={leftIconFamily}
              name={leftIconName}
              size={theme.SF(32)}
              color={iconColor}
            />
          </AnimatedPressable>
        )}
      </View>

      {/* Right Icon */}


      {/* Perfectly Centered Title */}
      <View style={styles.titleWrapper}>
        <CustomText style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </CustomText>
      </View>
      <View style={styles.rightside}>
        {hasRight ? (
          <AnimatedPressable
            onPress={onRightPress}
            style={styles.iconButton}
          >
            <VectoreIcons
              icon={rightIconFamily}
              name={rightIconName as string}
              size={theme.SF(26)}
              color={iconColor}
            />
          </AnimatedPressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
};

export default AppHeader;