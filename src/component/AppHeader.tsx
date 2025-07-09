import React, {useMemo} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import {SF, SH, SW, Fonts, Colors} from '../utils';
import {  AppText, VectoreIcons} from '.';

type AppHeaderProps = {
  headerStyle?: ViewStyle;
  LeftIconStyle?: TextStyle;
  rightView?: ViewStyle;
  LeftIconLeftStyle?: ViewStyle;
  headerTitle?: string;
  onPress?: (event: GestureResponderEvent) => void;
  titleStyle?: TextStyle;
  Iconname?: string;
  backgroundColor?: string;
  rightIcon?: string | false;
  rightOnPress?: () => void;
  smallTitle?: string;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  headerStyle={},
  headerTitle = '',
  onPress = () => {},
  Iconname,
  rightIcon = false,
  rightOnPress = () => {},
}) => {
  return (
    <View style={[styles.containerView,headerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.leftContainer, {height: '100%'}]}>
        {Iconname && (
          <VectoreIcons
            icon="FontAwesome"
            name={'angle-left'}
            size={SF(30)}
            color={Colors.textHeader}
          />
        )}
      </TouchableOpacity>
      <View style={styles.centerContainer}>
        {headerTitle && <AppText numberOfLines={1} style={styles.headerTitle}>{headerTitle}</AppText>}
      </View>
      <View style={styles.rightContainer}>
        {rightIcon && (
          <TouchableOpacity onPress={rightOnPress}>
            <VectoreIcons
              icon="Entypo"
              name={rightIcon}
              style={styles.rightIconStyle}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AppHeader;
const styles = StyleSheet.create({
  headerTitle: {
    fontSize: SF(18),
    fontFamily: Fonts.SEMI_BOLD,
    color: Colors.textHeader,
  },
  containerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: Platform.OS === 'ios' ? SF(42) : SF(42),
    shadowColor: Colors.textBlack,
    shadowOffset: {width: 0, height: 5},
  },
  centerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72%',
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '15%',
  },
  rightIconStyle: {
    fontSize: SF(25),
    color: Colors.themeColor,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '10%',
  },
  leftIconStyle: {
    fontSize: SF(25),
    color: Colors.textBlack,
    paddingRight: SH(20),
  },
});
