import React, { useState } from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import FastImage, { Source } from 'react-native-fast-image';
import Shimmer from './Shimmer';
import imagePaths from '@assets';

type ImageLoaderProps = {
  source?: Source | ImageSourcePropType | null;
  fallbackImage?: Source | ImageSourcePropType;
  mainImageStyle?: object;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
};

const ImageLoader: React.FC<ImageLoaderProps> = ({
  source,
  fallbackImage = imagePaths.no_image,
  mainImageStyle,
  resizeMode = 'cover',
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // ✅ Check if source is local (require) or remote (uri)
  const isRemote = (src: any): src is Source =>
    src && typeof src === 'object' && 'uri' in src;

  let imageToShow: Source | ImageSourcePropType = fallbackImage;

  if (!hasError && source) {
    if (isRemote(source)) {
      // remote image (uri)
      imageToShow = source.uri ? source : fallbackImage;
    } else {
      // local image (require)
      imageToShow = source;
    }
  }

  return (
    <View style={[styles.container, mainImageStyle]}>
      {loading && (
        <Shimmer
          style={[StyleSheet.absoluteFill, mainImageStyle]}
          borderRadius={8}
        />
      )}

      <FastImage
        source={imageToShow as Source}
        style={[styles.image, mainImageStyle]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setHasError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageLoader;
