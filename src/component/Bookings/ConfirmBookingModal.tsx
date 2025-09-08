import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, getPriceDetails, SF, SH, SW } from '../../utils';
import { AppText, Buttons, Checkbox, ServiceItem, Spacing, VectoreIcons } from '../../component';
import BookingServiceItem from './BookingServiceItem';


type ConfirmBookingModalProps = {
    modalVisible: boolean;
    forwhomCheck?: boolean;
    setForwhomCheck?: () => void;
    closeModal: () => void;
    btnSubmit: () => void;
    selectedDate?: string;
    service?: any;
    selectedSlot?: any;
    shopName?: string;
    shopAddress?: string;
    agentName?: string;
};
const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
    modalVisible = true,
    closeModal,
    forwhomCheck = false,
    setForwhomCheck,
    btnSubmit,
    selectedDate,
    service,
    selectedSlot,
    shopName = '',
    shopAddress = '',
    agentName = '',
}) => {
    // console.log('service--', service);
    // console.log('selectedSlot--', selectedSlot);
    // console.log('selectedDate--', selectedDate);
    const { displayPrice } = getPriceDetails(service);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => closeModal()}>
            <View style={styles.modalView}>
                <View style={styles.mainView}>
                    <TouchableOpacity onPress={() => closeModal()} style={styles.crossIcon}>
                        <VectoreIcons
                            icon='Ionicons'
                            name='close'
                            color={Colors.themeColor}
                            size={SF(30)}
                        />
                    </TouchableOpacity>
                    <Spacing space={SH(20)} />
                    <AppText style={styles.heading}>Confirmation</AppText>
                    <Spacing space={SH(20)} />
                    <AppText style={styles.dateorshopbame}>{selectedDate}</AppText>
                    <AppText style={styles.dateorshopbame}>{shopName}</AppText>
                    <AppText style={styles.shopaddress}>{shopAddress}</AppText>
                    <Spacing space={SH(20)} />

                    <ServiceItem
                        type='modal-view'
                        subtitles={`With ${agentName}`}
                        time={selectedSlot?.time?.slot || '10:00 AM'}
                        title={service?.serviceName || 'Haircut'}
                        price={`$${service?.price || '0.00'}`}
                        item={service}
                    />


                    <Spacing space={SH(8)} />

                    <BookingServiceItem
                        title='Subtotal'
                        price={`${displayPrice || '0.00'}`}
                    />
                    <View style={{ marginTop: 10, marginLeft: 2 }}>
                        <Checkbox size={SF(14)} lebelFontSize={SF(14)} color={Colors.themeColor} label='Booking for Other' checked={forwhomCheck} onChange={() => { setForwhomCheck && setForwhomCheck() }} />
                    </View>
                    <Spacing space={SH(70)} />
                    <Buttons
                        onPress={() => btnSubmit()}
                        title='Confirm'
                    />
                    <Spacing space={SH(8)} />
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmBookingModal;

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        backgroundColor: '#00000050',
        justifyContent: 'flex-end',
    },
    mainView: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: SW(10),
        borderTopRightRadius: SW(10),
        paddingHorizontal: SW(25),
        paddingBottom: SW(20)
    },
    heading: {
        color: Colors.textHeader,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(20),
        textAlign: 'center',
    },
    dateorshopbame: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(14),
        marginTop: SH(2.5)
    },
    shopaddress: {
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
        marginTop: SH(2.5)
    },
    crossIcon: {
        position: 'absolute',
        right: 4,
        top: 4,
        padding: 5,
        zIndex: 99999,
    },
});
