import React, { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppText, Container, SpecialItems, Spacing, SpecialItemsSkeleton } from '../../component';
import { Colors, Fonts, imagePaths, navigate, SF, SH, SW } from '../../utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ShopHeader, Shops, SubCatList } from '../../component';
import { useRoute } from '@react-navigation/native';
import { useGetProviderCatSubcatQuery, useGetSpecialOffersQuery } from '../../redux';
import RouteName from '../../navigation/RouteName';

interface shopProps { }

const SeparatorComponent = () => <Spacing space={SH(10)} />;
const SeparatorComponentSpecialOffer = () => <Spacing horizontal space={SH(15)} />;

const ShopList: React.FC<shopProps> = () => {
    const route = useRoute<any>();
    const { subCats = [], catName = '', catId } = route?.params;

    const [selectedSubCatId, setSelectedSubCatId] = React.useState<string | null>('all');

    const { data, isFetching, isError, refetch, } = useGetProviderCatSubcatQuery({ catId: catId, subCat: selectedSubCatId === 'all' ? null : selectedSubCatId });
    const memoizedData = useMemo(() => data?.data || [], [data]);
    console.log('shopDatashopData', memoizedData);

    const { data: specialData,
        isFetching: isFeatingSpecialOffer, isError: isErrorSpecialOffer, refetch: refetchSpecialOffer,
    } = useGetSpecialOffersQuery();
    const specialOffers = useMemo(() => specialData?.data || [], [specialData]);
    console.log('specialOffersspecialOffers', specialOffers);

    useEffect(() => {
        refetchSpecialOffer()
    }, [refetchSpecialOffer])

    React.useEffect(() => {
        if (catId) {
            refetch();
        }
    }, [selectedSubCatId, catId, refetch]);

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
                            data={isFeatingSpecialOffer ? [12, 23, 34, 45, 23] : specialOffers}
                            keyExtractor={(item, index) => item?.fullName + 'special-offer' + index}
                            contentContainerStyle={[styles.flatListRecommended, specialOffers?.length <= 0 ? styles.fullWidth : {}]}
                            ItemSeparatorComponent={SeparatorComponentSpecialOffer}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => {
                                return isFeatingSpecialOffer ?
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
                                !isFeatingSpecialOffer ?
                                    <View style={styles.emptyContainer1}>
                                        <AppText style={styles.emptyText1}>{isErrorSpecialOffer ? "Something went wrong!" : 'No Offer Available'}</AppText>
                                    </View>
                                    : null
                            }

                        />
                    </View>
                </>


                <FlatList
                    data={memoizedData || []}
                    keyExtractor={(item, index) => item?.businessName + 'baber-shop' + index}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={SeparatorComponent}
                    contentContainerStyle={styles.flatListRecommended}
                    ListHeaderComponent={listHeader}
                    renderItem={({ item, index }) => (
                        <Shops item={item} index={index} bookingType={'bookingType'} />
                    )}
                    ListEmptyComponent={
                        !isFetching ? (
                            <View style={styles.emptyContainer}>
                                <AppText style={styles.emptyText}>
                                    {isError ? "Something went wrong!" : "No shops found"}
                                </AppText>
                            </View>
                        ) : <View style={styles.emptyContainer}>
                            <AppText style={styles.emptyText}>
                                {"Loading......."}
                            </AppText>
                        </View>
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
