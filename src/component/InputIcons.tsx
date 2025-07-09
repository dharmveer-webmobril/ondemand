import React from 'react';
import {
  View,
  Image,
  ImageProps,
} from 'react-native';
import {SF, SH} from '../utils';
import imagePaths from '../assets/images';

type InputIconsProps = {
  icon: ImageProps;
};

const InputIcons: React.FC<InputIconsProps> = ({icon}) => {
  return (
    <View style={{paddingHorizontal: SF(10)}}>
      <Image
        source={icon}
        style={{width: SH(20), height: SH(20)}}
        resizeMode="contain"
      />
    </View>
  );
};

export default InputIcons;
