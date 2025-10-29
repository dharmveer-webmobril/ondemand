import { View, StyleSheet, FlatList } from 'react-native';
import React, { FC } from 'react';
import { arrangePrice, Colors, Fonts, getPriceDetails, SF, SH, SW } from '../../utils';
import { AppText, Buttons } from '../../component';

interface servicesInterface {
    onClick: (value: any) => void;
    data: any[];
}

const SeparatorComponent = () => <View style={styles.itemSeparator} />;

// Common function to get price details


const Services: FC<servicesInterface> = ({ onClick, data }) => {
    const renderItem = ({ item }: any) => {
        const { displayPrice, originalPrice, showDiscountedPrice, discountLabel } = getPriceDetails(item);
        return (
            <View style={styles.serviceItem}>
                <View>
                    <AppText style={styles.serviceTitle}>{item?.serviceName || ''}</AppText>
                    <AppText style={styles.serviceSub}>Popular Service</AppText>
                </View>
                <View style={styles.flexDir}>
                    <View style={styles.rightBlock}>
                        <AppText style={styles.price}>
                            {displayPrice || arrangePrice(0, item?.priceType || 'fixed')}
                        </AppText>
                        {showDiscountedPrice && (
                            <>
                                <AppText style={styles.originalPrice}>
                                    <AppText style={styles.strikeThrough}>
                                        {originalPrice || arrangePrice(0, item?.priceType || 'fixed')}
                                    </AppText>
                                </AppText>
                                {discountLabel && <AppText style={styles.discountText}>
                                    Save {discountLabel} Off
                                </AppText>}
                            </>
                        )}
                    </View>
                    <Buttons
                        buttonStyle={styles.bookBtn}
                        textColor={Colors.textWhite}
                        isExtraBoxShadow={false}
                        title={'Book'}
                        buttonTextStyle={styles.bookText}
                        onPress={() => { onClick(item); }}
                    />
                </View>
            </View>
        );
    };

    return (
        <>
            {data && data?.length > 0 ? (
                <FlatList
                    data={data}
                    keyExtractor={item => item?._id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={SeparatorComponent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.noServicesContainer}>
                    <AppText style={styles.noServicesText}>No Services Available</AppText>
                </View>
            )}
        </>
    );
};

export default Services;

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: SH(10),
        paddingHorizontal: SH(25),
    },
    flexDir: { flexDirection: 'row' },
    serviceItem: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingVertical: SH(15),
        paddingHorizontal: '3%',
        marginBottom: SH(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    serviceTitle: {
        fontSize: SF(10),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.lightGraytext,
    },
    serviceSub: {
        fontSize: SF(8),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
    },
    rightBlock: {
        alignItems: 'flex-end',
        marginRight: SW(15),
    },
    price: {
        fontSize: SF(10),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.lightGraytext,
    },
    originalPrice: {
        fontSize: SF(8),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        marginTop: 2,
    },
    strikeThrough: {
        textDecorationLine: 'line-through',
        color: Colors.gray1,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(8),
    },
    discountText: {
        fontSize: SF(8),
        color: Colors.successColor,
        fontFamily: Fonts.MEDIUM,
        marginTop: 2,
    },
    bookBtn: {
        backgroundColor: Colors.themeColor,
        alignSelf: 'center',
        width: SF(45),
        height: SF(22),
        borderRadius: SF(5),
        paddingHorizontal: SF(5),
    },
    bookText: {
        color: Colors.white,
        fontSize: SF(10),
        fontFamily: Fonts.MEDIUM,
    },
    itemSeparator: {
        height: 0.6,
        backgroundColor: '#3D3D3D40',
    },
    noServicesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: SH(200),
    },
    noServicesText: {
        color: Colors.textHeader,
    },
    paddingHoriTeamMeme: { paddingHorizontal: SW(30) },
});