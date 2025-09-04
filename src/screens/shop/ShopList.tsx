import React, { use, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppText, Container, SpecialItems, Spacing, SpecialItemsSkeleton, ShopsSkeleton } from '../../component';
import { Colors, Fonts, imagePaths, navigate, SF, SH, SW } from '../../utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ShopHeader, Shops, SubCatList } from '../../component';
import { useRoute } from '@react-navigation/native';
import { getProvidersByCatAndSubcat, getSpecialOffers, useGetSpecialOffersQuery } from '../../redux';
import RouteName from '../../navigation/RouteName';
import { useDispatch } from 'react-redux';

interface shopProps { }

const SeparatorComponent = () => <Spacing space={SH(10)} />;
const SeparatorComponentSpecialOffer = () => <Spacing horizontal space={SH(15)} />;

const ShopList: React.FC<shopProps> = () => {
    const route = useRoute<any>();
    const { subCats = [], catName = '', catId } = route?.params;

    const [selectedSubCatId, setSelectedSubCatId] = React.useState<string | null>('all');


    const dispatch = useDispatch<any>();

    const [isShopLoading, setIsShopLoading] = useState<boolean>(true);
    const [shopList, setShopList] = useState<any>(null);
    const [isShopError, setIsshopError] = useState<any>(null);


    useEffect(() => {
        getProviderList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubCatId, catId])

    function getProviderList() {
        setIsShopLoading(true)
        dispatch(getProvidersByCatAndSubcat({ catId: catId, subcatId: selectedSubCatId === 'all' ? null : selectedSubCatId }))
            .then((result: any) => {
                console.log('getProviderList result', result?.payload?.data);
                let res = result?.payload?.data
                if (res && res?.data?.length >= 0) {
                    res?.data && res?.data?.length > 0 ? setShopList(res?.data) : setShopList([])
                    setIsshopError(null)
                } else {
                    setIsshopError('Something went wrong');
                    setShopList([])
                }
            })
            .catch((err: any) => {
                setShopList([])
                setIsshopError('Something went wrong')
                console.log('errerrerr', err);
            })
            .finally(() => {
                setIsShopLoading(false);
            });
    }


    const [isSpecialLoading, setIsSpecialLoading] = useState<boolean>(true);
    const [specialOfferList, setSpecialOfferList] = useState<any>(null);
    const [isSpecialOfferError, setISpecialOfferError] = useState<any>(null);

    useEffect(() => {
        getSppecialOffer()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function getSppecialOffer() {
        setIsSpecialLoading(true)
        dispatch(getSpecialOffers())
            .then((result: any) => {
                console.log('getSpecialOffers result', result?.payload?.data);
                let res = result?.payload?.data
                if (res && res?.data?.length >= 0) {
                    res?.data && res?.data?.length > 0 ? setSpecialOfferList(res?.data) : setSpecialOfferList([])
                    setISpecialOfferError(null)
                } else {
                    setISpecialOfferError('Something went wrong');
                    setSpecialOfferList([])
                }
            })
            .catch((err: any) => {
                setSpecialOfferList([])
                setISpecialOfferError('Something went wrong')
                console.log('errerrerr', err);
            })
            .finally(() => {
                setIsSpecialLoading(false);
            });
    }

    const listHeader = () => (
        <AppText style={styles.listHeaderText}>
            {catName ? catName.trim().charAt(0).toUpperCase() + catName.trim().slice(1) : ''}
        </AppText>
    );

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
                    {subCats && (
                        <SubCatList
                            setSelectedSubCatId={setSelectedSubCatId}
                            selectedSubCatId={selectedSubCatId}
                            data={[{ _id: 'all', name: 'All' }, ...subCats]} // add "All" at start
                        />
                    )}
                </View>

                <>
                    <AppText style={[styles.specialOffersText, styles.marHori]}>Special Offers</AppText>
                    <View style={styles.specialOfferConatiner}>
                        <FlatList
                            horizontal
                            data={isSpecialLoading ? [12, 23, 34, 45, 23] : specialOfferList}
                            keyExtractor={(item, index) => item?.fullName + 'special-offer' + index}
                            contentContainerStyle={[styles.flatListRecommended, specialOfferList?.length <= 0 ? styles.fullWidth : {}]}
                            ItemSeparatorComponent={SeparatorComponentSpecialOffer}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => {
                                return isSpecialLoading ?
                                    <SpecialItemsSkeleton />
                                    :
                                    <SpecialItems
                                        id={item?._id}
                                        image={item?.bannerImage ? { uri: item?.bannerImage } : imagePaths?.no_image}
                                        name={item?.fullName}
                                        onClick={() => {
                                            navigate(RouteName.SHOP_DETAILS, { bookingType: 'bookingType', providerDetails: item });
                                        }}
                                    />
                            }}
                            ListEmptyComponent={
                                !isSpecialLoading ?
                                    <View style={styles.emptyContainer1}>
                                        <AppText style={styles.emptyText1}>{isSpecialOfferError ? isSpecialOfferError : 'No Offer Available'}</AppText>
                                    </View>
                                    : null
                            }

                        />
                    </View>
                </>


                <FlatList
                    data={isShopLoading ? ['33', '44', '66', '77'] : shopList}
                    keyExtractor={(item, index) => item?.businessName + 'baber-shop' + index}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={SeparatorComponent}
                    contentContainerStyle={styles.flatListRecommended}
                    ListHeaderComponent={listHeader}
                    renderItem={({ item, index }) => {
                        return isShopLoading ? <ShopsSkeleton /> : <Shops item={item} index={index} bookingType={'bookingType'} />
                    }}
                    ListEmptyComponent={
                        !isShopLoading ? (
                            <View style={styles.emptyContainer}>
                                <AppText style={styles.emptyText}>
                                    {isShopError ? isShopError : "No shops found"}
                                </AppText>
                            </View>
                        ) : null
                    }
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
        marginHorizontal: '3%',
    },
    specialOffersText: {
        marginTop: SF(15),
        marginHorizontal: SW(25),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        fontSize: SF(14),
    },
    listHeaderText: {
        marginHorizontal: '5%',
        marginBottom: SH(20),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        fontSize: SF(14),
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 70 },
    emptyText: { color: Colors.lightGraytext },
    emptyContainer1: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 4 },
    emptyText1: { color: Colors.textAppColor, textAlign: 'center' },
    flex1: { flex: 1 },
    fullWidth: { width: '100%' },
});
