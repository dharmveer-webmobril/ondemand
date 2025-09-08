import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors, Fonts, SF, SH, SW, getPriceDetails, imagePaths } from '../../utils';
import { AppHeader, AppText, Buttons, Container, UserprofileView } from '../../component';
import { useNavigation } from '@react-navigation/native';
import { SucessBookingModal } from '../../component';
import RouteName from '../../navigation/RouteName';
import { useSelector } from 'react-redux';
import { RootState, useCheckoutBookingMutation, useCreateBookingMutation } from '../../redux';
import moment from 'moment';

const PaymentScreen = () => {
    const [selectedPayment, setSelectedPayment] = useState('Online');
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [succesModalVisible, setSuccesModalVisible] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const bookingJson = useSelector((state: RootState) => state.service.bookingJson);
    console.log('bookingJsonbookingJsonbookingJsonbookingJson', bookingJson);

    const { service, providerDetails, selectedTeamMember, date, bookingType, bookingFor, slots } =
        bookingJson || {};

    const [submitBooking, { isLoading: isSubmitLoading }] = useCreateBookingMutation();
    const [submitCheckout, { isLoading: isCheckoutLoading }] = useCheckoutBookingMutation();
    const { displayPrice, originalPrice, showDiscountedPrice, discountLabel, discountedPrice } = getPriceDetails(service, 'fixed');
    const successModalButton = () => {
        setSuccesModalVisible(false);
        navigation.navigate(RouteName.MY_BOOKING, { id: bookingId });
    };

    const handleBooking = async () => {
        try {
            // Format slot
            let dayName = moment(date, "YYYY-MM-DD").format("dddd");
            const slotdata = {
                ...slots,
                date,
                day: dayName
            };
            // return
            // const [start, end] = slotdata && slotdata.slot.split(' - ');
            // const formattedData = {
            //     date: slotdata?.date || '',
            //     day: slotdata?.day || '',
            //     start,
            //     end,
            // };

            // Booking payload
            const bookingData = {
                serviceId: service?._id,
                promoCode: '',
                PaymentType: selectedPayment === 'Online' ? 'online' : 'offline',
                bookingType: bookingType,
                bookingFor: bookingFor,
                providerId: providerDetails._id,
                bookingDetails: {
                    memberId: selectedTeamMember?._id,
                    slotTime: slotdata,
                    address: bookingFor === 'other' ? '' : bookingJson?.myAddId,
                },
                otherUserId: bookingFor === 'other' ? bookingJson?.otherUserAddressId : null,
            };

            console.log('Booking Data:', bookingData);

            // Step 1: Create booking
            const bookingResponse = await submitBooking({ data: bookingData }).unwrap();
            console.log('Create Booking Response:', bookingResponse);

            if (bookingResponse?.booking?.bookingId) {
                const newBookingId = bookingResponse.booking.bookingId;
                setBookingId(newBookingId);

                let data = { bookingId: newBookingId, "paymentMethod": "card" }
                console.log('submitCheckout data', data);

                // Step 2: Call checkout API
                const checkoutResponse = await submitCheckout({ data }).unwrap();
                console.log('Checkout Response:', checkoutResponse);

                if (checkoutResponse?.success) {
                    setSuccesModalVisible(true);
                }
            }
        } catch (error) {
            console.error('Booking or checkout failed:', error);
        }
    };

    return (
        <Container>
            <SucessBookingModal
                bookingJson={bookingJson}
                submitButton={() => successModalButton()}
                modalVisible={succesModalVisible}
                closeModal={() => setSuccesModalVisible(false)}
            />

            <ScrollView style={styles.container}>
                {/* Header */}
                <AppHeader
                    headerTitle={'Book Appointment'}
                    onPress={() => navigation.goBack()}
                    Iconname="arrowleft"
                    rightOnPress={() => { }}
                    headerStyle={styles.header}
                />

                {/* Shop Info */}
                <View style={styles.shopInfo}>
                    <View style={styles.rowBetween}>
                        <AppText style={styles.shopName}>{providerDetails?.businessName}</AppText>
                        <AppText style={styles.shopName}>{date}</AppText>
                    </View>
                    <AppText style={styles.address}>
                        {[providerDetails?.location?.address, providerDetails?.location?.city, providerDetails?.location?.state]
                            .filter(Boolean)
                            .join(', ')}
                    </AppText>
                </View>

                {/* Barber Info */}
                <View style={styles.barberSection}>
                    <AppText style={[styles.subHeader, { marginTop: SH(20), marginBottom: SH(20) }]}>Selected Team</AppText>
                    <View style={{ marginLeft: -SW(15) }}>
                        <UserprofileView
                            imageSource={{ uri: selectedTeamMember?.profilePic }}
                            title={selectedTeamMember?.fullName}
                        />
                    </View>
                </View>

                {/* Service Card */}
                <View style={styles.serviceItem}>
                    <View>
                        <AppText style={styles.serviceTitle}>{service?.serviceName}</AppText>
                        <AppText style={styles.serviceSub}>Popular Service</AppText>
                    </View>
                    <View style={styles.rightBlock}>
                        <AppText style={styles.price}>{displayPrice}</AppText>
                    </View>
                </View>

                {/* Payment Options */}
                <AppText style={styles.sectionTitle}>Payment Options</AppText>
                {['Online', 'Pay Onsite'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.paymentOption, selectedPayment === method ? styles.paymentSelected : null]}
                        onPress={() => setSelectedPayment(method)}
                    >
                        <AppText style={styles.paymentText}>{method}</AppText>
                        <Image
                            style={{ height: SF(23), width: SF(23) }}
                            source={selectedPayment === method ? imagePaths.tick_square : imagePaths.untick_square}
                        />
                    </TouchableOpacity>
                ))}

                {/* Payment Summary */}
                <AppText style={styles.sectionTitle}>Payment Summary</AppText>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Item Total</AppText>
                    <AppText style={styles.valuetxt}>{originalPrice || 0}</AppText>
                </View>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Item Discount</AppText>
                    <AppText style={styles.valuetxtdeducted}>{discountedPrice || 0}</AppText>
                </View>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Service Fee</AppText>
                    <AppText style={styles.valuetxt}>0</AppText>
                </View>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Grand Total</AppText>
                    <AppText style={[styles.valuetxt, { fontFamily: Fonts.BOLD }]}>{displayPrice || 0}</AppText>
                </View>

                {/* Footer */}
                <View style={styles.bookingContainer}>
                    <View>
                        <AppText style={styles.price1}>{displayPrice}</AppText>
                    </View>
                    <Buttons
                        buttonStyle={styles.w65}
                        title={isSubmitLoading || isCheckoutLoading ? 'Processing...' : 'Book'}
                        onPress={handleBooking}
                        buttonTextStyle={{ color: Colors.white }}
                    />
                </View>
            </ScrollView>
        </Container>
    );
};

export default PaymentScreen;


const styles = StyleSheet.create({
    container: { paddingHorizontal: SF(25), paddingBottom: SF(25), marginLeft: 4, backgroundColor: Colors.bgwhite },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 0, paddingHorizontal: 0 },
    shopInfo: { marginTop: SH(20) },
    shopName: { fontSize: SF(14), fontFamily: Fonts.MEDIUM, color: Colors.textAppColor },
    address: { fontSize: SF(12), color: Colors.lightGraytext, marginTop: 8 },
    subHeader: { color: Colors.textAppColor, fontFamily: Fonts.MEDIUM, fontSize: SF(12), },
    barberSection: { marginVertical: SH(10), borderBottomWidth: 1, borderBottomColor: Colors.textAppColor + '20' },
    serviceItem: {
        backgroundColor: '#0000000D',
        borderRadius: 10,
        paddingVertical: SH(15),
        paddingHorizontal: '3%',
        marginBottom: SH(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SH(10),
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
    price1: {
        fontSize: SF(14),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
    },
    duration1: {
        fontSize: SF(12),
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        marginTop: 2,
    },
    crossIcon: {
        position: 'absolute',
        right: -4,
        top: -6,
    },
    sectionTitle: { fontFamily: Fonts.SEMI_BOLD, color: Colors.textAppColor, marginTop: SH(15), marginBottom: SH(10), fontSize: SF(16) },
    paymentOption: {
        borderWidth: 1,
        borderColor: Colors.textAppColor + '50',
        borderRadius: SF(8),
        paddingHorizontal: SF(15),
        paddingVertical: SF(8),
        marginBottom: SH(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentSelected: {
        borderColor: '#2196F3',
        backgroundColor: '#E6F0FA',
    },
    paymentText: {
        fontSize: SF(14),
        color: Colors.textAppColor,
        fontFamily: Fonts.REGULAR,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: SH(4),
    },
    valuetxt: {
        fontSize: SF(14),
        color: Colors.textAppColor,
        fontFamily: Fonts.REGULAR,
    },
    valuetxtdeducted: {
        fontSize: SF(14),
        color: '#52B46B',
        fontFamily: Fonts.REGULAR,
    },
    bookingContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SH(40), marginBottom: 20, alignItems: 'center' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    w65: { width: '65%' },
});