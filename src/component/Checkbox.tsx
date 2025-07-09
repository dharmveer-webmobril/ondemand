import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, DimensionValue, TextStyle } from 'react-native';

import { AppText, VectoreIcons } from '.';
import { Colors, SF } from '../utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: number;
  color?: string;
  lebelFontSize?:number,
  checkBoxTextStyle?:TextStyle
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  size = 24,
  color = Colors.themeColor,
  lebelFontSize=SF(12),
  checkBoxTextStyle={}
}) => {
  return (
    <TouchableOpacity onPress={() => onChange(!checked)}
    activeOpacity={0.8}  style={{flexDirection:"row",alignItems:"center"}}>
    <View
      
      style={[styles.container, { height: size, width: size, borderColor: color }]}
    >
      {checked && <VectoreIcons
        icon='Entypo'
        size={size - 5}
        color={color}
        name={'check'}
      />}
    </View>
      {label && <AppText style={[styles.label,{fontSize:lebelFontSize},checkBoxTextStyle]}>{label}</AppText>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  checkbox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
  },
  label: {
    fontSize: SF(16),
    marginLeft:10
  },
});

export default Checkbox;
