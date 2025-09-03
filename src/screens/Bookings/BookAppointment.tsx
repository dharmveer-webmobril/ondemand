import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader, AppText, BookingSlots, Buttons, Container, Divider, LoadingComponent, showAppToast, Spacing } from '../../component';
import { Colors, Fonts, imagePaths, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { ConfirmBookingModal, TeamMemberProfile } from '../../component';
import RouteName from '../../navigation/RouteName';
import { RootState, setBookingJson, useGetMemberSlotsQuery, useGetProviderMemberQuery } from '../../redux';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';

interface BookAppointmentProps { }


const BookAppointment: React.FC<BookAppointmentProps> = () => {

    const navigation = useNavigation<any>();
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [slotArr, setSlotArr] = useState<any>(null)
    const [selectedMember, setSelectedMember] = useState<any>('anyone')
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [forwhomCheck, setForwhomCheck] = useState(false);
    const [selectedDate, setSelectedDate] = useState<any>(moment().format('YYYY-MM-DD'));
    const dispatch = useDispatch();

    const bookingJson = useSelector((state: RootState) => state.service.bookingJson);
    const { service, selectedTeamMember, providerDetails } = bookingJson || {};
    console.log('bookingJson--', bookingJson);


    let serviceSlots: any[] = []

    console.log('serviceSlots--', serviceSlots);

    const { data: membersList, isFetching: isProviderMemberLoading } = useGetProviderMemberQuery({ providerId: providerDetails?._id });
    const membersListData = useMemo(() => {
        const data = membersList?.data || [];
        if (data.length > 0) {
            return [{ _id: 'anyone', fullName: 'Anyone', profilePic: imagePaths.no_user_img }, ...data];
        }
        return data;
    }, [membersList]);

    console.log('membersListmembersList--', membersList);

    const { data: slots, isFetching: isSlots, refetch: refetchSlots, } = useGetMemberSlotsQuery({ memberId: selectedMember === 'anyone' ? null : selectedMember });
    console.log('slotsslotsslots--', slots);

    const slotsData = useMemo(() => slots?.data || [], [slots])

    useEffect(() => {
        let dayName = moment(selectedDate, "YYYY-MM-DD").format("dddd");
        console.log('dayName--', dayName); // Output: "Wednesday"
        if (slotsData && dayName) {
            let slotsFind = slotsData[dayName]
            setSlotArr(slotsFind)
            setSelectedSlot(null)
            console.log('slotsFindslotsFind', slotsFind);
        }
    }, [slotsData, selectedDate]);

    useEffect(() => {
        refetchSlots()
    }, [selectedMember, refetchSlots])

    const btnGo = () => {
        let selectedSlotInfo = slotArr[selectedSlot];
        let selTeamMember = selectedMember === 'anyone' ? slots?.memberId : selectedMember;

        let chosenTeamMember = membersListData?.find((item: any) => item?._id === selTeamMember)
        let bookingData = { ...bookingJson, slots: selectedSlotInfo, selectedDate, selectedTeamMember: chosenTeamMember };

        console.log('-----bookingData-----', bookingData);

        if (forwhomCheck) {
            bookingData = { ...bookingData, bookingFor: 'other', date: selectedDate };
            dispatch(setBookingJson(bookingData));
            setTimeout(() => {
                navigation.navigate(RouteName.ADD_OTHER_PERSON_DETAIL)
            }, 200);
        } else {
            bookingData = { ...bookingData, bookingFor: 'self', date: selectedDate };
            dispatch(setBookingJson(bookingData));
            setTimeout(() => {
                navigation.navigate(RouteName.SELECT_ADDRESS, { prevType: 'forSelf' })
            }, 200);
        }
    };

    const btnBook = () => {
        if (selectedSlot === null) {
            showAppToast({
                title: 'Error',
                message: 'Please select a slot',
                type: 'error',
            });
            return;
        }
        setModalVisible(true);
    }

    const addressData = providerDetails?.location || {};
    const addressSummery = [addressData.address, addressData.city, addressData.state].filter(Boolean).join(', ');

    return (
        <Container isPadding={false}>
            <ConfirmBookingModal
                forwhomCheck={forwhomCheck}
                selectedDate={selectedDate}
                shopAddress={addressSummery || ''}
                shopName={selectedTeamMember?.businessName || ''}
                agentName={selectedTeamMember?.fullName || ''}
                service={service}
                selectedSlot={serviceSlots[selectedSlot]}
                setForwhomCheck={() => { setForwhomCheck(!forwhomCheck) }}
                modalVisible={modalVisible}
                closeModal={() => {
                    setModalVisible(false);
                }}
                btnSubmit={() => {
                    setModalVisible(false);
                    btnGo();
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
                <LoadingComponent visible={isProviderMemberLoading || isSlots} />

                <Calendar
                    current={moment().format('YYYY-MM-DD')}
                    minDate={moment().format('YYYY-MM-DD')}
                    onDayPress={(day) => {
                        setSelectedDate(day.dateString);
                    }}
                    markedDates={{
                        [selectedDate]: {
                            selected: true,
                            selectedColor: Colors.themeColor,
                            selectedTextColor: '#fff',
                        },
                    }}
                    theme={{
                        selectedDayBackgroundColor: Colors.themeColor,
                        arrowColor: '#000',
                    }}
                />

                <View style={styles.contentPadding}>
                    <Divider contStyle={{ marginVertical: SW(10) }} color='#3D3D3D50' height={0.7} />
                    {
                        <BookingSlots slots={slotArr} isFetching={false} selectedSlot={selectedSlot} onSelect={(val: any) => { setSelectedSlot(val) }} />
                    }

                    {
                        <>
                            <Divider marginTop={SF(10)} color='#3D3D3D50' height={0.7} />
                            <AppText style={[styles.subHeader, { marginTop: SH(10) }]}>Selected Member</AppText>
                            <Spacing space={SH(15)} />
                            <View style={styles.memberRow}>
                                {
                                    membersListData?.map((item: any) => {
                                        return <View key={item?._id + 'team-member'} style={[styles.memberItem, { minWidth: SW(90) }]}>
                                            <TeamMemberProfile
                                                selectedMember={selectedMember}
                                                onClick={() => { setSelectedMember(item?._id) }}
                                                imageSource={item?._id === 'anyone' ? imagePaths?.no_user_img : item?.profilePic ? { uri: item?.profilePic } : imagePaths?.no_user_img}
                                                title={item?.fullName}
                                                item={item}
                                            />
                                        </View>
                                    })
                                }
                            </View>
                            <Divider contStyle={{ marginVertical: SW(10) }} color='#3D3D3D50' height={0.7} />

                            <Spacing />
                            <View style={styles.serviceItem}>
                                {/* <TouchableOpacity style={styles.crossIcon}>
                                    <VectoreIcons
                                        icon='AntDesign'
                                        name='closecircle'
                                        color='#BBBBBB'
                                        size={SF(16)}
                                    />
                                </TouchableOpacity> */}
                                <View>
                                    <AppText style={styles.serviceTitle}>{service?.serviceName}</AppText>
                                    <AppText style={styles.serviceSub}>Popular Service</AppText>
                                </View>
                                <View style={styles.rightBlock}>
                                    <AppText style={styles.price}>${service?.price}</AppText>
                                    {/* <AppText style={styles.duration}>25m</AppText> */}
                                </View>
                            </View>
                            {/* add another button========= */}
                            {/* <TouchableOpacity style={styles.addAnotoherButton}>
                                <AppText style={styles.addAnotoherButtonTxt}>
                                    <VectoreIcons
                                        icon='Entypo'
                                        name='plus'
                                        color={Colors.themeColor}
                                        size={SF(14)}
                                    /> Add another service</AppText>
                            </TouchableOpacity> */}

                            <Divider contStyle={{ marginTop: SH(30) }} color='#3D3D3D50' height={0.7} />
                            <View style={styles.bookingContainer}>
                                <View>
                                    <AppText style={styles.price1}>${service?.price}</AppText>
                                    {/* <AppText style={styles.duration1}>25m</AppText> */}
                                </View>
                                <Buttons
                                    buttonStyle={styles.w65}
                                    title='Book'
                                    onPress={() => { btnBook() }}
                                    buttonTextStyle={{ color: Colors.white }}
                                />
                            </View>
                        </>
                    }

                </View>
            </ScrollView>
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
    bookingContainer: { flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginTop: SH(20) }
    , contentPadding: { paddingHorizontal: '7%' }
    , memberRow: { marginLeft: -SW(15), flexDirection: 'row' }
    , memberItem: { alignItems: 'center', justifyContent: 'center' }
    , w65: { width: '65%' }
});
