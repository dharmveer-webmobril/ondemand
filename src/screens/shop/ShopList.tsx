import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppText, Container, HomeRecommendedItems, Spacing } from '../../component';
import { Colors, Fonts, recommendedData, SF, SH, SW } from '../../utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ShopHeader, Shops, SubCatList } from './component';
import { useRoute } from '@react-navigation/native';
import { getProvidersByCatAndSubcat, useGetProviderCatSubcatQuery } from '../../redux';
import { useDispatch } from 'react-redux';

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
                            data={recommendedData}
                            keyExtractor={(item, index) => item.name + 'recomded' + index}
                            contentContainerStyle={styles.flatListRecommended}
                            ItemSeparatorComponent={SeparatorComponentSpecialOffer}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => <HomeRecommendedItems {...item} />}
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
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 70 }}>
                                <AppText style={{ color: Colors.lightGraytext }}>
                                    {isError ? "Something went wrong!" : "No shops found"}
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
});
