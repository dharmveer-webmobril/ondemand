import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, SH } from '../utils';

type DividerProps = {
  color?: string;
  width?: string | number;
  marginTop?: number; 
  height?: number; 
  contStyle?:ViewStyle
};

const Divider: React.FC<DividerProps> = ({
  color,
  width,
  marginTop = 0,
  height = SH(1),
  contStyle={}
}) => { 

  const styles = useMemo(() => {
    return StyleSheet.create({
      containerStyle: {
        height: height,
        marginTop: marginTop,
        width: width ?? '100%',
        backgroundColor: color ||'transparent', 
      } as ViewStyle,
    });
  }, [color, height, marginTop, width]);

  return <View style={[styles.containerStyle,contStyle]} />;
};

export default Divider;
