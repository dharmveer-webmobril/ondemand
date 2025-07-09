import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DimensionValue,
} from 'react-native';
import React from 'react';
import { Colors, Fonts, SF, SW } from '../../utils';
import AppText from '../AppText';

interface HomeSubContainerHeaderProps {
  onClick?: (text: string) => void;
  leftText: string;
  rightText: string;
  marginHori?:DimensionValue
}

const HomeSubContainerHeader: React.FC<HomeSubContainerHeaderProps> = ({
  leftText,
  rightText,
  marginHori=SW(20),
  onClick = () => {},
}) => {
  return (
    <View style={[styles.container,{marginHorizontal:marginHori}]}>
      <AppText style={styles.leftText}>{leftText}</AppText>
      <TouchableOpacity style={styles.rightTextContainer} onPress={() => onClick(rightText)}>
        <AppText style={styles.rightText}>{rightText}</AppText>
      </TouchableOpacity>
    </View>
  );
};

export default HomeSubContainerHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftText: {
    width: '70%',
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(14),
    color: Colors.textAppColor,
  },
  rightTextContainer: {
    width: '30%',
    alignItems: 'flex-end',
  },
  rightText: {
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(14),
    textAlign: 'right',
    textDecorationLine: 'underline',
    color: Colors.themeDarkColor,
  },
});
