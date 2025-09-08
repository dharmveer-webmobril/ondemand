import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, FlatList } from 'react-native';
import { AppHeader, AppText, BookingSlots, Buttons, Container, Divider, LoadingComponent, ServiceItem, showAppToast, Spacing } from '../../component';
import { Colors, Fonts, getPriceDetails, imagePaths, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { ConfirmBookingModal, TeamMemberProfile } from '../../component';
import RouteName from '../../navigation/RouteName';
import { RootState, setBookingJson, useGetMemberSlotsQuery, useGetProviderMemberQuery } from '../../redux';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { skipToken } from '@reduxjs/toolkit/query';

interface BookAppointmentProps { }

const BookAppointment: React.FC<BookAppointmentProps> = () => {
    const navigation = useNavigation<any>();
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [slotArr, setSlotArr] = useState<any>(null);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [forwhomCheck, setForwhomCheck] = useState(false);
    const [selectedDate, setSelectedDate] = useState<any>(moment().format('YYYY-MM-DD'));
    const dispatch = useDispatch();

    const bookingJson = useSelector((state: RootState) => state.service.bookingJson);
    const { service, providerDetails } = bookingJson || {};
    // console.log('bookingJson--', bookingJson);

    let serviceSlots: any[] = [];

    // console.log('serviceSlots--', serviceSlots);

    const { data: membersList, isFetching: isProviderMemberLoading } = useGetProviderMemberQuery(
        { providerId: providerDetails?._id },
        { refetchOnFocus: true, refetchOnMountOrArgChange: true }
    );

    const membersListData = useMemo(() => {
        let data = membersList?.data || [];
        if (data && data.length > 0) {
            setSelectedMember(data[0]);
            data[0]?.type === 'provider' ? setSelectedMemberId(data[0]?.providerId) : setSelectedMemberId(data[0]?._id);
        }
        return data
    }, [membersList, providerDetails]);

    // console.log('membersListData--', membersList);

    const { data: slots, isFetching: isSlots, refetch: refetchSlots } = useGetMemberSlotsQuery(
        selectedMemberId ? { memberId: selectedMemberId } : skipToken,
        { refetchOnFocus: true, refetchOnMountOrArgChange: true }
    );

    useEffect(() => {
        console.log('selectedMemberselectedMember--', selectedMember);
        console.log('slotArr--', slotArr);
        console.log('membersListData--', membersListData);

        setSlotArr(null);
        if (selectedMember && typeof selectedMember === 'string' && selectedMember !== 'anyone') {
            refetchSlots();
        }
    }, [selectedMember, refetchSlots]);


    const slotsData = useMemo(() => slots?.data || [], [slots]);

    useEffect(() => {
        let dayName = moment(selectedDate, 'YYYY-MM-DD').format('dddd');
        if (slotsData && dayName) {
            let slotsFind = slotsData[dayName];
            setSlotArr(slotsFind);
            setSelectedSlot(null);
        }
    }, [slotsData, selectedDate]);

    const btnGo = () => {
        let selectedSlotInfo = slotArr[selectedSlot];

        let member = membersListData?.find((item: any) => item?._id === selectedMember?._id);

        let bookingData = { ...bookingJson, slots: selectedSlotInfo, selectedDate, selectedTeamMember: member };

        if (forwhomCheck) {
            bookingData = { ...bookingData, bookingFor: 'other', date: selectedDate };
            dispatch(setBookingJson(bookingData));
            setTimeout(() => {
                navigation.navigate(RouteName.ADD_OTHER_PERSON_DETAIL);
            }, 200);
        } else {
            bookingData = { ...bookingData, bookingFor: 'self', date: selectedDate };
            dispatch(setBookingJson(bookingData));
            setTimeout(() => {
                navigation.navigate(RouteName.SELECT_ADDRESS, { prevType: 'forSelf' });
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
    };

    const addressData = providerDetails?.location || {};
    const addressSummery = [addressData.address, addressData.city, addressData.state].filter(Boolean).join(', ');


    const { displayPrice } = getPriceDetails(service, 'fixed');
    return (
        <Container isPadding={false}>
            <ConfirmBookingModal
                forwhomCheck={forwhomCheck}
                selectedDate={selectedDate}
                shopAddress={addressSummery || ''}
                shopName={providerDetails?.businessName || ''}
                agentName={selectedMember?.fullName || ''}
                service={service}
                selectedSlot={selectedSlot && slotArr && slotArr[selectedSlot]}
                setForwhomCheck={() => { setForwhomCheck(!forwhomCheck); }}
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
                    {<BookingSlots slots={slotArr} isFetching={false} selectedSlot={selectedSlot} onSelect={(val: any) => { setSelectedSlot(val); }} />}

                    <>
                        <Divider marginTop={SF(10)} color='#3D3D3D50' height={0.7} />
                        <AppText style={[styles.subHeader, { marginTop: SH(10) }]}>Select Member</AppText>
                        <Spacing space={SH(15)} />
                        <View style={styles.memberRow}>
                            <FlatList
                                data={membersListData}
                                keyExtractor={(item) => item?._id + 'team-member'}
                                renderItem={({ item }) => (
                                    <View style={styles.memberItem}>
                                        <TeamMemberProfile
                                            selectedMember={selectedMember?._id || ''}
                                            onClick={() => { item?.type === 'provider' ? setSelectedMemberId(item?.providerId) : setSelectedMemberId(item?._id); setSelectedMember(item); }}
                                            imageSource={item?._id === 'anyone' ? imagePaths?.no_user_img : item?.profilePic ? { uri: item?.profilePic } : imagePaths?.no_user_img}
                                            title={item?.fullName}
                                            item={item}
                                        />
                                    </View>
                                )}
                                ListEmptyComponent={() => (
                                    <AppText style={{ color: Colors.lightGraytext, fontFamily: Fonts.MEDIUM, fontSize: SF(12) }}>
                                        No team member found
                                    </AppText>
                                )}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.memberListContent}
                            />
                        </View>
                        <Divider contStyle={{ marginVertical: SW(10) }} color='#3D3D3D50' height={0.7} />

                        <Spacing />

                        {service && [service]?.map((item) => {
                            return <ServiceItem item={item} type='service-item' />;
                        })}

                        <Divider contStyle={{ marginTop: SH(30) }} color='#3D3D3D50' height={0.7} />
                        <View style={styles.bookingContainer}>
                            <View>
                                <AppText style={styles.price1}>{displayPrice || 0}</AppText>
                            </View>
                            <Buttons
                                buttonStyle={styles.w65}
                                title='Book'
                                onPress={() => { btnBook(); }}
                                buttonTextStyle={{ color: Colors.white }}
                            />
                        </View>
                    </>
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
        fontSize: SF(12),
    },
    crossIcon: {
        position: 'absolute',
        right: -4,
        top: -6,
    },
    addAnotoherButton: {
        paddingVertical: 7,
        alignSelf: 'flex-end',
    },
    addAnotoherButtonTxt: {
        color: Colors.themeColor,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(12),
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
    bookingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SH(20) },
    contentPadding: { paddingHorizontal: '7%' },
    memberRow: { marginLeft: -SW(15), flexDirection: 'row' },
    memberItem: { alignItems: 'center', justifyContent: 'center', marginRight: SW(15) },
    w65: { width: '65%' },
    memberListContent: { paddingTop: SH(10), paddingBottom: SH(5), paddingRight: SW(15), paddingLeft: 10 },
});