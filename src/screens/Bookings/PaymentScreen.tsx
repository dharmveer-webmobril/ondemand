import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors, Fonts, SF, SH, SW, imagePaths } from '../../utils';
import { AppHeader, AppText, Buttons, Checkbox, Container, Spacing, UserprofileView, VectoreIcons } from '../../component';
import { useNavigation } from '@react-navigation/native';
import { SucessBookingModal } from './component';
import RouteName from '../../navigation/RouteName';

const PaymentScreen = () => {
    const [selectedPayment, setSelectedPayment] = useState('Online');
    const [usePoints, setUsePoints] = useState(true);
    const navigation = useNavigation<any>();
    const [succesModalVisible, setSuccesModalVisible] = useState<boolean>(false)
    const successModalButton = () => {
        setSuccesModalVisible(false)
        navigation.navigate(RouteName.MY_BOOKING, {id: 123 });
    }
    return (
        <Container>
            <SucessBookingModal
                submitButton={() => { successModalButton() }}
                modalVisible={succesModalVisible}
                closeModal={() => { setSuccesModalVisible(false) }}
            />
            <ScrollView style={styles.container}>
                {/* Header */}
                <AppHeader
                    headerTitle={'Book Appointment'}
                    onPress={() => {
                        navigation.goBack();
                    }}
                    Iconname="arrowleft"
                    rightOnPress={() => { }}
                    headerStyle={styles.header}
                />

                {/* Shop Info */}
                <View style={styles.shopInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <AppText style={styles.shopName}>WM Barbershop</AppText> <AppText style={styles.shopName}>WM Barbershop</AppText>
                    </View>
                    <AppText style={styles.address}>1893 Cheshire Bridge Rd Ne, 30325</AppText>
                </View>

                {/* Barber Info */}
                <View style={styles.barberSection}>
                    <AppText style={[styles.subHeader, { marginTop: SH(20), marginBottom: SH(20) }]}>Your Barber</AppText>
                    <View style={{ marginLeft: -SW(15) }}>
                        <UserprofileView />
                    </View>
                </View>

                {/* Service Card */}
                <View style={styles.serviceItem}>
                    <TouchableOpacity style={styles.crossIcon}>
                        <VectoreIcons
                            icon='AntDesign'
                            name='closecircle'
                            color='#BBBBBB'
                            size={SF(16)}
                        />
                    </TouchableOpacity>
                    <View>
                        <AppText style={styles.serviceTitle}>{'Only Haircut'}</AppText>
                        <AppText style={styles.serviceSub}>Popular Service</AppText>
                    </View>
                    <View style={styles.rightBlock}>
                        <AppText style={styles.price}>$55.00</AppText>
                        <AppText style={styles.duration}>25m</AppText>
                    </View>
                </View>

                {/* Payment Options */}
                <AppText style={styles.sectionTitle}>Payment Options</AppText>
                {['Online', 'Pay Onsite'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        style={[styles.paymentOption]}
                        onPress={() => setSelectedPayment(method)}
                    >
                        <AppText>{method}</AppText>
                        <Image
                            style={{ height: SF(23), width: SF(23) }}
                            source={selectedPayment == method ? imagePaths.tick_square : imagePaths.untick_square}
                        />
                    </TouchableOpacity>
                ))}

                {/* Summary */}
                <AppText style={styles.sectionTitle}>Payment Summary</AppText>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Item Total</AppText>
                    <AppText style={styles.valuetxt}>$75</AppText>
                </View>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Item Discount</AppText>
                    <AppText style={styles.valuetxtdeducted}>- $20</AppText>
                </View>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Service Fee</AppText>
                    <AppText style={styles.valuetxt}>$55</AppText>
                </View>

                {/* Credit Points */}

                <View style={{ marginTop: 10 }}>
                    <Checkbox size={SF(14)} lebelFontSize={SF(14)} color={Colors.themeColor} label='Avail discount using platform credit points' checked={true} onChange={() => { }} />
                </View>
                <View style={[styles.summaryRow, { marginTop: SH(15) }]}>
                    <AppText style={styles.valuetxt}>Discount</AppText>
                    <AppText style={styles.valuetxt}>20</AppText>
                </View>
                <View style={styles.summaryRow}>
                    <AppText style={styles.valuetxt}>Grand Total</AppText>
                    <AppText style={[styles.valuetxt, { fontFamily: Fonts.BOLD }]}>$55</AppText>
                </View>


                {/* Footer */}
                <View style={styles.bookingContainer}>
                    <View>
                        <AppText style={styles.price1}>$55.00</AppText>
                        <AppText style={styles.duration1}>25m</AppText>
                    </View>
                    <Buttons
                        buttonStyle={{ width: '65%' }}
                        title='Book'
                        onPress={() => { setSuccesModalVisible(true) }}
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
    subHeader: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12)
    },
    barberSection: { marginVertical: SH(10), borderBottomWidth: 1, borderBlockColor: Colors.textAppColor + '20', },
    serviceItem: {
        backgroundColor: '#0000000D',
        borderRadius: 10,
        paddingVertical: SH(15),
        paddingHorizontal: '3%',
        marginBottom: SH(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SH(10)
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
        marginTop: 3
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
        top: -6
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
    bookingContainer: { flexDirection: 'row', justifyContent: "space-between", marginTop: SH(40), marginBottom: 20 },


    backArrow: { fontSize: SF(20) },
    title: { fontSize: SF(18), fontWeight: 'bold' },
    date: { fontSize: SF(12), color: 'gray' },
    barberImage: { width: SW(50), height: SW(50), borderRadius: SW(25) },
    barberName: { marginLeft: SW(10), fontSize: SF(14) },
    verified: { marginLeft: SW(5), fontSize: SF(14) },
    serviceCard: {
        backgroundColor: '#F3F3F3',
        padding: SF(10),
        borderRadius: SF(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: SH(10),
    },
    serviceName: { fontWeight: 'bold', fontSize: SF(14) },
    serviceTag: { fontSize: SF(12), color: 'gray' },
    servicePrice: { fontWeight: 'bold', fontSize: SF(14) },
    serviceDuration: { fontSize: SF(12), color: 'gray' },

    paymentSelected: {
        borderColor: '#2196F3',
        backgroundColor: '#E6F0FA',
    },

    discount: { color: 'green' },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SH(10),
    },
    totalLabel: { 
        fontWeight: 'bold', 
        fontSize: SF(14) 
    },
    totalValue: { 
        fontWeight: 'bold', 
        fontSize: SF(14) 
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SH(30),
    },
    footerPrice: { 
        fontWeight: 'bold', 
        textAlign: 'center', 
        fontSize: SF(16) 
    },
    bookButton: {
        backgroundColor: '#2E6F9A',
        paddingVertical: SH(12),
        paddingHorizontal: SW(30),
        borderRadius: SF(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    bookButtonText: { color: 'white', fontWeight: 'bold', fontSize: SF(16) },
});
