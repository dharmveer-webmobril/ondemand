import React, { useState } from "react";
import { View, StyleProp, ImageStyle as RNImageStyle, StyleSheet } from "react-native";
import FastImage, {
  Source,
  ResizeMode,
  ImageStyle,
} from "react-native-fast-image";
import { Skeleton } from "./Skeleton";

// Replace with your local fallback image path
const fallbackImage = require("../assets/images/no_image.jpg");

interface ImageLoaderProps {
  mainImageStyle: StyleProp<ImageStyle>;
  source: Source;
  resizeMode?: ResizeMode;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  mainImageStyle = {},
  resizeMode = "cover",
  source,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // console.log('sourcesourcesource',source);

  const handleLoadStart = () => {
    // only start loading if not already failed
    if (!hasError) setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setLoading(false);
  };

  // Use fallback image only if load failed
  const imageToShow: Source = hasError ? fallbackImage : source;

  return (
    <View>
      {/* Skeleton shown only while loading and not errored */}
      {loading && !hasError && (
        <View
          style={[
            styles.skeletonContainer,
            mainImageStyle as RNImageStyle,
          ]}
        >
          <Skeleton animation="wave" style={[mainImageStyle,{backgroundColor:'#E0E0E0'}]} />
        </View>
      )}

      <FastImage
        source={imageToShow}
        style={mainImageStyle}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    position: "absolute",
    zIndex: 1,
  },
});

export default ImageLoader;
