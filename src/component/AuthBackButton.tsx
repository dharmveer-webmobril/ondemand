import React, { PropsWithChildren } from 'react';
import { TextProps, TouchableOpacity } from 'react-native';
import { VectoreIcons } from '.';
import { Colors, goBack, SF } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AuthBackButton: React.FC<PropsWithChildren<TextProps>> = (props) => {
  const insets = useSafeAreaInsets();
  return <TouchableOpacity style={{ padding: 5, paddingRight: 8, position: 'absolute', top: insets.top, left: SF(20), zIndex: 9999 }} onPress={() => { goBack() }}>
    <VectoreIcons
      icon="FontAwesome"
      name={'angle-left'}
      size={SF(30)}
      color={Colors.textHeader}
    />
  </TouchableOpacity>;
};

export default AuthBackButton;
