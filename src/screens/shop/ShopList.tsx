import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppText, Container, HomeRecommendedItems, Spacing } from '../../component';
import { Colors, Fonts, recommendedData, SF, SH, subCatDdata, SW } from '../../utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ShopHeader, Shops, SubCatList } from './component';
import { useRoute } from '@react-navigation/native';

interface shopProps { }



const SeparatorComponent = () => <Spacing space={SH(10)} />;
const SeparatorComponentSpecialOffer = () => <Spacing horizontal space={SH(15)} />;

const ShopList: React.FC<shopProps> = () => {
    // immidiate
    const route = useRoute<any>();
    let bookingType = route?.params?.bookingType;
    const listHeader = () => (
        <AppText style={styles.listHeaderText}>Barber shop (250)</AppText>
    );
    // useFocusEffect(
    //     React.useCallback(() => {
    //         StatusBar.setBackgroundColor(Colors.themeDarkColor);
    //         StatusBar.setBarStyle('light-content');
    //         return () => {
    //             StatusBar.setBackgroundColor('#ffffff');
    //             StatusBar.setBarStyle('dark-content');
    //         };
    //     }, []),
    // );
    return (
        <Container isAuth statusBarStyle="light-content" statusBarColor={Colors.themeDarkColor}>
            <ShopHeader />
            <KeyboardAwareScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <Spacing />
                <View style={styles.paddHori}>
                    <SubCatList data={subCatDdata} />
                </View>
                {
                    bookingType === 'immidiate' && <Spacing space={SH(20)} />
                }
                {bookingType !== 'immidiate' &&
                    <>
                        <AppText style={[styles.specialOffersText, styles.marHori]}>Special Offers</AppText>
                        <View style={[styles.specialOfferConatiner, {}]}>
                            <FlatList
                                horizontal
                                data={recommendedData}
                                keyExtractor={(item, index) => item.name + 'recomded' + index}
                                contentContainerStyle={styles.flatListRecommended}
                                ItemSeparatorComponent={SeparatorComponentSpecialOffer}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => <HomeRecommendedItems {...item} />}
                            />
                        </View>
                    </>
                }
                <FlatList
                    data={recommendedData}
                    keyExtractor={(item, index) => item.name + 'baber-shop' + index}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={SeparatorComponent}
                    ListHeaderComponent={listHeader}
                    renderItem={({ item, index }) => (
                        <Shops item={item} index={index} bookingType={bookingType} />
                    )}
                />
            </KeyboardAwareScrollView>
        </Container>
    );
};

export default ShopList;

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: SH(30),
    },
    paddHori: {
        paddingHorizontal: '5%',
    },
    marHori: {
        marginHorizontal: '5%',
    },
    specialOfferConatiner: {
        marginRight: '3%',
        marginLeft: '3.3%',
    },
    flatListRecommended: {
        marginBottom: SH(35),
        marginTop: SH(15),
        marginHorizontal: '2%'
    },
    specialOffersText: {
        marginTop: SF(15),
        marginHorizontal: SW(25),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        fontSize: SF(14)
    },
    listHeaderText: {
        marginHorizontal: '5%',
        marginBottom: SH(20),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        fontSize: SF(14)
    },
    topImage: {
        height: '190%',
        width: '100%',
    },
    bottomImg: {
        height: '100%',
        width: '100%',
    },
    topImageContainer: {
        height: SH(90),
        borderRadius: SW(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bgwhite,
        overflow: 'hidden',
    },
    topImagesmallContainer: {
        height: SH(82),
        width: '23.5%',
        borderRadius: SW(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bgwhite,
        marginTop: SH(7),
        overflow: 'hidden',
    },
    itemContainer: {
        marginHorizontal: SW(25),
    },
    topImagesWrapper: {
        backgroundColor: '#0000001A',
        paddingHorizontal: 4,
        paddingVertical: 6,
        borderRadius: SW(10),
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
        lineHeight: SH(17),
    },
});
