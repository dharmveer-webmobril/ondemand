import { StyleSheet, View, Pressable, Image } from 'react-native';
import React from 'react';
import { boxShadowlight, Colors, Fonts, SF, SH, SW } from '../../utils';
import { AppText } from '../../component';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import Shimmer from '../Shimmer';

interface ShopsProps {
    item: any;
    index: number;
    bookingType?: string
}

const Shops: React.FC<ShopsProps> = ({ item, bookingType = null }) => {
    const navigation = useNavigation<any>();
    console.log('item?.bannerImage', item?.bannerImage);
    const addressData = item?.location || {};
    const addressSummery = [addressData.address, addressData.city, addressData.state].filter(Boolean).join(', ');
    return (
        <Pressable
            onPress={() => {
                navigation.navigate(RouteName.SHOP_DETAILS, { bookingType: bookingType, providerDetails: item });
            }}
        >
            <View style={styles.topImagesWrapper}>
                <View style={[styles.topImageContainer, boxShadowlight]}>
                    <Image source={{ uri: item?.bannerImage }} resizeMode='cover' style={styles.topImage} />
                </View>
                {/* <View style={styles.smallImagesRow}>
                    {[imagePaths.barber3, imagePaths.barber4, imagePaths.barber3, imagePaths.barber4].map((img, idx) => (
                        <View key={idx.toString() + 'img'} style={[styles.topImagesmallContainer, boxShadowlight]}>
                            <ImageLoader source={img} resizeMode="contain" mainImageStyle={styles.bottomImg} />
                        </View>
                    ))}
                </View> */}
            </View>

            <View style={styles.textInfoRow}>
                <View style={styles.textBlock}>
                    <AppText style={styles.shopName}>{item?.businessName || ''}</AppText>
                    <AppText style={styles.shopAddress}>
                        {addressSummery ? addressSummery.trim().charAt(0).toUpperCase() + addressSummery.trim().slice(1) : ''} {'\n'}
                    </AppText>
                </View>
                <View style={styles.reviewBlock}>
                    {
                        item.avgRating ?
                            <AppText style={styles.reviewText}>
                                {item.avgRating}{'\n'}<AppText style={{ fontSize: SF(10), color: Colors.textAppColor, }}>
                                    {/* 140 Reviews */}
                                </AppText>
                            </AppText>
                            : null
                    }
                </View>
            </View>
        </Pressable>
    );
};

export const ShopsSkeleton: React.FC = React.memo(() => {
    return (
        <View>
            <View style={styles.topImagesWrapper}>
                <View style={[styles.topImageContainer, boxShadowlight]}>
                    <Shimmer style={styles.topImage} />
                </View>
                {/* <View style={styles.smallImagesRow}>
                    {[1, 2, 3, 4].map((_, idx) => (
                        <View key={idx.toString() + 'skel'} style={[styles.topImagesmallContainer, boxShadowlight]}>
                            <Shimmer style={styles.bottomImg} />
                        </View>
                    ))}
                </View> */}
            </View>

            <View style={styles.textInfoRow}>
                <View style={styles.textBlock}>
                    <Shimmer style={styles.shopNameSkeleton} />
                    <Shimmer style={styles.shopAddressSkeleton} />
                </View>
                <View style={styles.reviewBlock}>
                    <Shimmer style={styles.reviewTextSkeleton} />
                </View>
            </View>
        </View>
    );
});


export default Shops;


const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: SH(30),
    },

    specialOfferConatiner: {
        paddingLeft: 10,
        paddingRight: SW(25),
    },
    flatListRecommended: {
        marginBottom: SH(35),
        marginTop: SH(15),
        marginLeft: SW(15),
    },
    specialOffersText: {
        marginTop: SH(15),
        marginHorizontal: SW(25),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
    },
    listHeaderText: {
        marginHorizontal: SW(25),
        marginBottom: SH(20),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
    },
    topImage: {
        height: '100%',
        width: '100%',
    },
    bottomImg: {
        height: '100%',
        width: '100%',
    },
    topImageContainer: {
        height: SF(190),
        borderRadius: SF(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bgwhite,
        overflow: 'hidden',
    },
    topImagesmallContainer: {
        height: SF(70),
        width: '23.5%',
        borderRadius: SF(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bgwhite,
        marginTop: SH(7),
        overflow: 'hidden',
    },
    itemContainer: {
        marginHorizontal: '5%',
    },
    topImagesWrapper: {
        backgroundColor: '#0000001A',
        paddingHorizontal: SF(4),
        paddingVertical: SF(6),
        borderRadius: SF(10),
    },
    smallImagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textInfoRow: {
        margin: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textBlock: {
        width: '72%',
    },
    shopName: {
        fontFamily: Fonts.MEDIUM,
        color: Colors.textAppColor,
        fontSize: SF(12),
    },
    shopNameSkeleton: {
        height: SF(12),
        width: SF(100),
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    shopAddress: {
        fontFamily: Fonts.MEDIUM,
        color: Colors.lightGraytext,
        fontSize: SF(10),
    },
    shopAddressSkeleton: {
        height: SF(10),
        width: SF(120),
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
        marginTop: 4,
    },
    reviewBlock: {
        width: '26%',
    },
    reviewText: {
        fontFamily: Fonts.MEDIUM,
        color: Colors.textAppColor,
        fontSize: SF(14),
        textAlign: 'center',
        // lineHeight: SH(17),
    },
    reviewTextSkeleton: {
        height: SF(14),
        width: SF(40),
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
});
