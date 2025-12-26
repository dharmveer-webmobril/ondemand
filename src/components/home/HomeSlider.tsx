import { View, Text, StyleSheet, Image, ImageProps } from 'react-native'
import React, { useMemo } from 'react'
import imagePaths from '@assets';
import { ThemeType, useThemeContext } from '@utils/theme';
import Swiper from 'react-native-swiper';
const imageData = [
    { image: imagePaths.plumb_img, id: 1 },
    { image: imagePaths.carpentry, id: 2 },
    { image: imagePaths.electrical, id: 4 },
    { image: imagePaths.painting, id: 3 },
    { image: imagePaths.cleaning, id: 6 },
    { image: imagePaths.electrical, id: 5 },
    { image: imagePaths.cleaning, id: 7 },
];
export default function HomeSlider() {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), []);
    return (
        <View style={{ paddingHorizontal: 20,flex:1}}>
            <Swiper
                showsButtons={false}
                style={styles.wrapper}
                pagingEnabled={true}
                autoplay

                dot={<View style={styles.dot} />}
                activeDot={<View style={styles.activeDot} />}
                paginationStyle={styles.paginationStyle}
            >
                {imageData.map((item: { id: number; image: ImageProps; }) => (
                    <View style={[styles.slide]} key={item.id}>
                        <View style={[styles.imageBox,]}>
                            <Image
                                resizeMode="cover"
                                style={styles.image}
                                source={item.image}
                            />
                        </View>
                    </View>
                ))}
            </Swiper>
        </View>
    )
}

const createStyles = (theme: ThemeType) => {
    const { colors: Colors, SF, fonts: Fonts, SW } = theme;
    return StyleSheet.create({
        wrapper: {
            height: SF(160),
        },
        dot: {
            backgroundColor: Colors.gray,
            width: SF(10),
            height: SF(10),
            borderRadius: SF(10) / 2,
            marginLeft: SF(3),
            marginRight: SF(3),
            marginBottom: -SF(20),
        },
        activeDot: {
            backgroundColor: Colors.primary,
            width: SF(10),
            height: SF(10),
            borderRadius: SF(10) / 2,
            marginLeft: SF(3),
            marginRight: SF(3),
            marginBottom: -SF(20),
        },
        paginationStyle: {
            bottom: 0,
        },
        slide: {
            height: SF(160),
            borderRadius: SF(10),
        },
        image: {
            height: '100%',
            width: '100%',
        },
        imageBox: {
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            marginVertical: 2,
        },
        loaderContainer: {
            height: SF(160),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5F5F5',
            borderRadius: SF(10),
        },
        errorContainer: {
            height: SF(160),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFF',
            borderRadius: SF(10),
            paddingHorizontal: SW(15),
        },
        errorText: {
            fontSize: SF(14),
            fontFamily: Fonts.MEDIUM,
            color: Colors.red,
            textAlign: 'center',
        },
        emptyContainer: {
            height: SF(160),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFF',
            borderRadius: SF(10),
            paddingHorizontal: SW(15),
        },
        emptyText: {
            fontSize: SF(14),
            fontFamily: Fonts.MEDIUM,
            color: Colors.text,
            textAlign: 'center',
        },
    })
}