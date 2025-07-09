import React from 'react';
import {
  View,
  Image,
  ImageProps,
  DimensionValue,
} from 'react-native';
import { SF, SH, SW } from '../utils';
import imagePaths from '../assets/images';

type AuthImgCompProps = {
  icon: ImageProps;
  height?: DimensionValue,
  width?: DimensionValue,
};

const AuthImgComp: React.FC<AuthImgCompProps> = ({ icon, width = SF(200), height = SF(200) }) => {
  return (
    <View style={{ paddingHorizontal: SF(10) }}>
      <Image
        source={icon}
        style={{
          height,
          width,
          alignSelf: 'center',
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default AuthImgComp;
