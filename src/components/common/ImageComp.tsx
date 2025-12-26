import { SF } from '@utils/dimensions';
import React from 'react';
import {
    Image,
    ImageProps,
    DimensionValue,
    ImageResizeMode,
} from 'react-native';

type ImageCompProps = {
    imageSource: ImageProps;
    resizeMode?: ImageResizeMode;
    height?: DimensionValue,
    width?: DimensionValue,
    marginLeft?: any,
    marginRight?: any,
    marginTop?: any,
    marginBottom?: any,
};

const ImageComp: React.FC<ImageCompProps> = ({ imageSource, width = SF(200), height = SF(200), marginLeft = 0, marginRight = 0, marginBottom = 0, marginTop = 0, resizeMode = 'contain' }) => {
    return <Image
        source={imageSource}
        style={{
            height,
            marginLeft,
            marginRight,
            width,
            marginTop,
            marginBottom,
        }}
        resizeMode={resizeMode}
    />
};

export default ImageComp;
