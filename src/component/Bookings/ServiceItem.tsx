import React from 'react';
import { View, StyleSheet, Pressable, Keyboard, TouchableOpacity } from 'react-native';
import { arrangePrice, boxShadow, Colors, commonStyles, Fonts, getPriceDetails, SF, SH, SW } from '../../utils';
import { AppText, Buttons, ImageLoader } from '../../component';
import moment from 'moment';

interface ServiceItemProps {
    item?: any;
    onClick?: () => void;
    title?: string;
    subtitles?: string;
    time?: string;
    price?: string;
    type?: string;
    isDeleteShow?: boolean;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ item, onClick, type = 'service-item', time, price, title, subtitles, isDeleteShow }) => {
    // Common function to get price details
    console.log(item);

    const { displayPrice, originalPrice, showDiscountedPrice, discountLabel } = getPriceDetails(item);

    if (type === 'service-item') {
        return (
            <View style={styles.serviceItem}>
                <View>
                    <AppText style={styles.serviceTitle}>{item?.serviceName}</AppText>
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
                                <AppText style={styles.discountText}>
                                    Save {discountLabel} Off
                                </AppText>
                            </>
                        )}
                    </View>
                </View>
                {isDeleteShow && <TouchableOpacity
                    style={{ position: "absolute", width: SW(25), height: SW(25), borderRadius: SW(12.5), backgroundColor: Colors.themeColor, top: -5, right: -5 }}
                    onPress={onClick}
                />}
            </View>
        );
    }

    return (
        <View style={styles.serviceItem}>
            <View>
                <AppText style={styles.serviceTitle}>{title}</AppText>
                {subtitles && <AppText style={styles.serviceSub}>{subtitles}</AppText>}
                {time && <AppText style={styles.serviceSub}>{time}</AppText>}
            </View>
            <AppText style={styles.price}>{displayPrice || arrangePrice(0, item?.priceType || 'fixed')}</AppText>
        </View>
    );
};

export default ServiceItem;

const styles = StyleSheet.create({
    serviceItem: {
        backgroundColor: '#0000000D',
        borderRadius: 10,
        paddingVertical: SH(15),
        marginBottom: SH(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '3%',
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
        marginTop: 3,
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
    duration: {
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
    originalPrice: {
        fontSize: SF(8),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        marginTop: 2,
    },
    flexDir: { flexDirection: 'row' },
});