import React, { PropsWithChildren } from 'react';
import { Text, TextProps } from 'react-native';

const AppText: React.FC<PropsWithChildren<TextProps>> = (props) => {
  return <Text {...props} allowFontScaling={false}>{props.children}</Text>;
};

export default AppText;
