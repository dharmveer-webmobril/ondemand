import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader, AppText, BookingSlots, Buttons, Calender, Container, Divider, ImageLoader, Spacing, UserprofileView, VectoreIcons } from '../../component';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import imagePaths from '../../assets/images';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ConfirmBookingModal } from './component';
import RouteName from '../../navigation/RouteName';

interface BookAppointmentProps { }
const timeSlots = [
    { id: 1, time: '8:00 am' },
    { id: 2, time: '8:30 am' },
    { id: 3, time: '9:00 am' },
    { id: 4, time: '9:30 am' },
    { id: 5, time: '10:00 am' },
    { id: 6, time: '10:30 am' },
    { id: 7, time: '11:00 am' },
];

const BookAppointment: React.FC<BookAppointmentProps> = () => {
    const route = useRoute<any>();
    let bookingType = route?.params?.bookingType;
    const navigation = useNavigation<any>();
    const [selectedSlot, setSelectedSlot] = useState<any>(1)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [forwhomCheck, setForwhomCheck] = useState(false)

    return (
        <Container isPadding={false}>
            <ConfirmBookingModal
                forwhomCheck={forwhomCheck}
                setForwhomCheck={() => { setForwhomCheck(!forwhomCheck) }}
                modalVisible={modalVisible}
                closeModal={() => {
                    setModalVisible(false);
                }}
                btnSubmit={() => {
                    setModalVisible(false);
                    if (forwhomCheck) {
                        setTimeout(() => {
                            navigation.navigate(RouteName.ADD_OTHER_PERSON_DETAIL)
                        }, 200);
                    } else {
                        setTimeout(() => {
                            // navigation.navigate(RouteName.PAYMENT_SCREEN)
                            navigation.navigate(RouteName.SELECT_ADDRESS, { prevType: 'forSelf' })
                        }, 200);
                    }
                }}
            />

            <AppHeader
                headerTitle={'Book an Appointment'}
                onPress={() => {
                    navigation.goBack();
                }}
                Iconname="arrowleft"
                rightOnPress={() => { }}
                headerStyle={styles.header}
            />

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <Calender
                    minDate={new Date(2025, 3, 16)}
                    maxDate={new Date(2026, 6, 15)}
                />
                <View style={{ paddingHorizontal: "7%" }}>
                    <Divider contStyle={{ marginVertical: SW(10) }} color='#3D3D3D50' height={0.7} />
                    <BookingSlots slots={timeSlots} selectedSlot={selectedSlot} onSelect={(val: any) => { setSelectedSlot(val) }} />


                    {
                        bookingType != 'immediate' &&
                        <>
                            <Divider marginTop={SF(10)} color='#3D3D3D50' height={0.7} />
                            <AppText style={[styles.subHeader, { marginTop: SH(10) }]}>Your Barber</AppText>
                            <Spacing space={SH(15)} />
                            <View style={{ marginLeft: -SW(15) }}>
                                <UserprofileView />
                            </View>
                            <Divider contStyle={{ marginVertical: SW(10) }} color='#3D3D3D50' height={0.7} />

                            <Spacing />
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
                            {/* add another button========= */}
                            <TouchableOpacity style={styles.addAnotoherButton}>
                                <AppText style={styles.addAnotoherButtonTxt}>
                                    <VectoreIcons
                                        icon='Entypo'
                                        name='plus'
                                        color={Colors.themeColor}
                                        size={SF(14)}
                                    /> Add another service</AppText>
                            </TouchableOpacity>

                            <Divider contStyle={{ marginTop: SH(30) }} color='#3D3D3D50' height={0.7} />
                            <View style={styles.bookingContainer}>
                                <View>
                                    <AppText style={styles.price1}>$55.00</AppText>
                                    <AppText style={styles.duration1}>25m</AppText>
                                </View>
                                <Buttons
                                    buttonStyle={{ width: '65%' }}
                                    title='Book'
                                    onPress={() => setModalVisible(true)}
                                    buttonTextStyle={{ color: Colors.white }}
                                />
                            </View>
                        </>
                    }

                </View>
            </ScrollView>
            {bookingType == 'immediate' && <Buttons
                buttonStyle={{ width: '80%', alignSelf: "center", marginBottom: 10 }}
                title='Continue'
                onPress={() => navigation.navigate(RouteName.SHOP_LIST, { bookingType: bookingType })}
                buttonTextStyle={{ color: Colors.white }}
            />}
        </Container>
    );
};

export default BookAppointment;

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.bgwhite,
        paddingHorizontal: SW(30),
    },
    scrollContainer: {
        paddingBottom: SH(30),
    },

    subHeader: {
        color: Colors.textAppColor,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(12)
    },
    crossIcon: {
        position: 'absolute',
        right: -4,
        top: -6
    },
    addAnotoherButton: {
        paddingVertical: 7,
        alignSelf: 'flex-end'
    },
    addAnotoherButtonTxt: {
        color: Colors.themeColor,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(12)
    },
    serviceItem: {
        backgroundColor: '#0000000D',
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
    bookingContainer: { flexDirection: 'row', justifyContent: "space-between", marginTop: SH(20) }
});
