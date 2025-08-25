import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable, Keyboard } from 'react-native';
import { boxShadow, Colors, commonStyles, Fonts, navigate, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, ImageLoader } from '../../../component';
import RouteName from '../../../navigation/RouteName';
import moment from 'moment';

interface BookingItemsProps {
    item?: any;
}

const BookingItems: React.FC<BookingItemsProps> = ({ item }) => {
    let serviceName = item?.service?.serviceName || '';
    let serviceImage = item?.service?.servicesImage?.length > 0 ? item?.service?.servicesImage[0] : 'no-image';
    let provider = item?.provider || '';
    let fromService = item?.provider?.fullName || '';
    let bookingDate = item?.bookingDetails?.slotTime?.date || '';
    let bookingTime = `${item?.bookingDetails?.slotTime?.start}-${item?.bookingDetails?.slotTime?.end}` || '';
    bookingDate = bookingDate ? moment(bookingDate).format('YYYY-MM-DD') : '';
    let servicePrice = item?.service?.price || 0;


    const addressData = provider?.location || {};
    const addressSummery = [addressData.address, addressData.city, addressData.state].filter(Boolean).join(', ');


    return (
        <Pressable onPress={() => navigate(RouteName.BOOK_DETAILS)} style={styles.serviceContainer}>
            <View style={styles.header}>
                <View style={[styles.imageWrapper, boxShadow]}>
                    <ImageLoader source={{ uri: serviceImage }} resizeMode="cover" mainImageStyle={styles.logo} />
                </View>
                <View style={styles.infoContainer}>
                    <AppText style={styles.text}>
                        {serviceName}
                        <AppText style={{ color: Colors.lightGraytext }}>  with {fromService}</AppText>
                    </AppText>
                    <AppText style={styles.dateTime}>{`${bookingDate} ${'\n'}${bookingTime}`}</AppText>
                    <AppText style={styles.dateTime}>{provider?.businessName}</AppText>
                    <AppText style={styles.dateTime}>{addressSummery}</AppText>
                    <View style={[commonStyles.rowSpaceBetweenCss, { marginTop: SF(7) }]}>
                        <AppText style={styles.price}>{`$${servicePrice}`}</AppText>
                        <Buttons
                            isExtraBoxShadow={false}
                            buttonStyle={styles.bookAgain}
                            textColor={Colors.textWhite}
                            buttonTextStyle={styles.bookAgainText}
                            title={'Book Again'}
                            onPress={() => {
                                Keyboard.dismiss();
                            }}
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    );
};



export default BookingItems;


const styles = StyleSheet.create({
    serviceContainer: {
        marginHorizontal: SW(20),
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
        padding: SW(15),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        width: SF(82),
        height: SF(113),
        borderRadius: SF(10) / 2,
        overflow: 'hidden'
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        flex: 1,
        paddingLeft: SF(10)
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SW(10),
    },
    text: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
        maxWidth: '80%',
    },
    dateTime: {
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(8),
        maxWidth: '80%',
        marginTop: SH(3)
    },

    price: {
        color: Colors.themeColor,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(16),
        maxWidth: '80%',
        marginTop: 3
    },
    bookAgain: {
        backgroundColor: Colors.themeColor,
        height: SF(22),
        width: SW(75),
        alignSelf: 'flex-end',
        borderRadius: SF(6)
    },
    bookAgainText: {
        fontSize: SF(10),
        fontFamily: Fonts.SEMI_BOLD
    },
});

