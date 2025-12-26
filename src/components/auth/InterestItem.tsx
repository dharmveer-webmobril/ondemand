// components/InterestItem.tsx
import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, TextStyle, View, ImageSourcePropType } from 'react-native';
import { useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader } from '@components/common';
import imagePaths from '@assets';
import { Source } from 'react-native-fast-image';

type InterestItemProps = {
    name: string;
    isSelected: boolean;
    onPress: () => void;
    textStyle?: TextStyle;
    image: string | null | ImageSourcePropType | Source;
};

const InterestItem: React.FC<InterestItemProps> = ({
    name,
    isSelected,
    onPress,
    image
}) => {
    const theme = useThemeContext();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            borderRadius: theme.borderRadius.lg,
            borderWidth: isSelected ? 2 : 2,
            borderColor: isSelected ? theme.colors.white : theme.colors.primary,
            backgroundColor: theme.colors.primary,
            width: '48%',
            marginBottom: theme.margins.lg,
            paddingBottom: theme.margins.lg,
            overflow: 'hidden',
        },
        shadowStyle: {
            shadowColor: "#fff",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
        },
        imageStyle: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottomLeftRadius: theme.borderRadius.lg, borderBottomRightRadius: theme.borderRadius.lg }
    }), [isSelected, theme.borderRadius.lg, theme.colors.primary, theme.colors.white, theme.margins.lg])

    // Convert image to proper format for ImageLoader
    const getImageSource = () => {
        if (!image || image === null) {
            return imagePaths.no_image;
        }
        // If it's a string URL, convert to Source format
        if (typeof image === 'string') {
            return { uri: image };
        }
        // Otherwise return as is (ImageSourcePropType or Source)
        return image;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={1}
            style={[styles.container, isSelected ? styles.shadowStyle : null]}
        >
            <View style={styles.imageStyle}>
                <ImageLoader 
                    source={getImageSource()} 
                    mainImageStyle={{ width: theme.SW(130), height: theme.SH(105) }} 
                    resizeMode="cover"
                    fallbackImage={imagePaths.no_image}
                />
            </View>
            <CustomText numberOfLines={1} color={theme.colors.whitetext} textAlign={'center'} marginTop={10} fontSize={theme.fontSize.sm} fontFamily={theme.fonts.MEDIUM}>
                {name}
            </CustomText>
        </TouchableOpacity>
    );
};

export default InterestItem;