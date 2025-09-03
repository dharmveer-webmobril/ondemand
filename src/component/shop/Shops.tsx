import { StyleSheet, View, Pressable, Image } from 'react-native';
import React from 'react';
import { boxShadowlight, Colors, Fonts, SF, SH, SW } from '../../utils';
import { AppText } from '../../component';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';

interface ShopsProps {
    item: any;
    index: number;
    bookingType?: string
}

const Shops: React.FC<ShopsProps> = ({ item,  bookingType = null }) => {
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
                    {/* <AppText style={styles.reviewText}>
                        4.5{'\n'}<AppText style={{ fontSize: SF(10), color: Colors.textAppColor, }}>140 Reviews</AppText>
                    </AppText> */}
                </View>
            </View>
        </Pressable>
    );
};

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
    shopAddress: {
        fontFamily: Fonts.MEDIUM,
        color: Colors.lightGraytext,
        fontSize: SF(10),
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
});
