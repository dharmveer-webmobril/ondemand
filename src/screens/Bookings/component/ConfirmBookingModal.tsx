import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, Checkbox, Spacing, VectoreIcons } from '../../../component';
import BookingServiceItem from './BookingServiceItem';


type ConfirmBookingModalProps = {
    modalVisible: boolean;
    forwhomCheck?: boolean;
    setForwhomCheck?:  () => void;
    closeModal: () => void;
    btnSubmit: () => void;
};
const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
    modalVisible = true,
    closeModal,
    forwhomCheck=false,
    setForwhomCheck,
    btnSubmit
}) => {
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
                    <AppText style={styles.dateorshopbame}>06-March-2025</AppText>
                    <AppText style={styles.dateorshopbame}>WM Barbershop</AppText>
                    <AppText style={styles.shopaddress}>1893 Cheshire Bridge Rd Ne, 30325</AppText>
                    <Spacing space={SH(20)} />

                    <BookingServiceItem
                        subtitles='With Juana'
                        time='8:00 am - 8:30 am'
                        title='Only Haircut'
                        price='$8989'
                    />
                    <Spacing space={SH(8)} />
                    <BookingServiceItem
                        title='Subtotal'
                        price='$8989'
                    />
                    <View style={{ marginTop: 10, marginLeft: 2 }}>
                        <Checkbox size={SF(14)} lebelFontSize={SF(14)} color={Colors.themeColor} label='Booking for Other' checked={forwhomCheck} onChange={()=>{setForwhomCheck && setForwhomCheck()}} />
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
        padding:5,
        zIndex:99999,
    },
});
