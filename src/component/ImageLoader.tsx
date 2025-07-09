 
import React, { useState } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import FastImage, { Source, ResizeMode, ImageStyle } from "react-native-fast-image";
import { Skeleton } from "./Skeleton";

interface ImageLoaderProps {
    mainImageStyle: StyleProp<ImageStyle>; // Style for the main image
    source: Source; // Source for FastImage
    resizeMode?: ResizeMode; // Resize mode for FastImage
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ mainImageStyle = {}, resizeMode = 'contain', source }) => {
    const [loading, setLoading] = useState<boolean>(true);

    const handleLoadStart = () => {
        setLoading(true);
    };

    const handleLoadEnd = () => {
        setLoading(false);
    };

    return (
        <>
            {loading && (
                <View style={[{ position: "absolute", zIndex: 999 }, mainImageStyle as ViewStyle]}>
                    <Skeleton animation="wave" style={mainImageStyle} />
                </View>
            )}
            <FastImage
                resizeMode={resizeMode}
                style={mainImageStyle}
                source={source}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
            />
        </>
    );
};

export default ImageLoader;


{/* example of use================================
    
    <View>
    <ImageLoader
        mainImageStyle={{
            width: SW(120),
            height: SW(120),
            borderRadius: SW(7),
        }}
        resizeMode="cover"
        source={{ uri: 'https://cdn.pixabay.com/photo/2024/02/15/13/52/students-8575444_1280.png' }}
    />
</View> */}
