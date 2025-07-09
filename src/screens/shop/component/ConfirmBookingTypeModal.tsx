import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, Checkbox, DropdownComponent, Spacing, VectoreIcons } from '../../../component';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../../navigation/RouteName';

const data = [
    { label: '$ 25 / Monthly Routine', value: '1' },
    { label: '$ 30 / Quarterly Routine', value: '2' },
    { label: '$ 300 / 6-Month Routine', value: '3' },
    { label: '$ 500 / Yearly Routine', value: '4' },
];

type ConfirmBookingTypeModalProps = {
    modalVisible: boolean;
    closeModal: () => void;
    submitButton: () => void;
};



const ConfirmBookingTypeModal: React.FC<ConfirmBookingTypeModalProps> = ({
    modalVisible = true,
    closeModal,
}) => {
    const navigation = useNavigation<any>();
    const [checkServiceType, setcheckServiceType] = useState('current')
    const btnCheckServiceType = (type: string) => {
        if (type == checkServiceType) return;
        if (type == 'current') setcheckServiceType(type);
        if (type == 'routine') setcheckServiceType(type);

    }

    const brnSubmit = () => {
        closeModal();
        if (checkServiceType == 'current') {
            navigation.navigate(RouteName.BOOK_APPOINT)
        } else {
            navigation.navigate(RouteName.BOOK_APPOINT)
        }
        // navigation.navigate(RouteName.SELECT_ADDRESS)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}>
            <View style={styles.modalView}>
                <View style={styles.mainView}>
                    <TouchableOpacity onPress={closeModal} style={styles.crossIcon}>
                        <VectoreIcons
                            icon='Ionicons'
                            name='close'
                            color={Colors.themeColor}
                            size={SF(28)}
                        />
                    </TouchableOpacity>

                    <AppText style={styles.heading}>Confirmation</AppText>

                    <Checkbox
                        checked={checkServiceType === 'current'}
                        size={SF(18)}
                        color={'#404040'}
                        lebelFontSize={SF(14)}
                        onChange={() => { btnCheckServiceType('current') }}
                        label="Continue for current service"
                    />
                    <Spacing />

                    <Checkbox
                        checked={checkServiceType === 'routine'}
                        size={SF(18)}
                        color={'#404040'}
                        lebelFontSize={SF(14)}
                        onChange={() => btnCheckServiceType('routine')}
                        label="Routine Booking"
                    />

                    <DropdownComponent
                        isDisable={checkServiceType === 'current'}
                        placeholderText='Select plan'
                        selectedvalue="$ 25 / Monthly Routine"
                        dropdown={styles.dropdownStyle}
                        selectedTextStyle={styles.dropdownSelectedText}
                        placeholderStyle={styles.dropdownPlaceholderText}
                        data={data}
                    />

                    <Buttons
                        onPress={() => {
                            brnSubmit()
                        }}
                        title='Confirm'
                    />

                    <Spacing space={SH(8)} />
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmBookingTypeModal;

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        backgroundColor: '#00000050',
        justifyContent: 'flex-end',
    },
    mainView: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: SF(10),
        borderTopRightRadius: SF(10),
        paddingHorizontal: SF(25),
        paddingBottom: SW(20),
    },
    heading: {
        color: Colors.textHeader,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(20),
        textAlign: 'center',
        marginTop: SH(22),
        marginBottom: SH(20),
    },
    crossIcon: {
        position: 'absolute',
        right: 4,
        top: 4,
        padding:5,
        zIndex:99999,
    },
    dropdownStyle: {
        backgroundColor: '#F2F2F2',
        paddingHorizontal: SF(25),
        paddingVertical: 15,
        borderWidth: 0,
        marginTop: SH(20),
        marginBottom: SH(90),
    },
    dropdownSelectedText: {
        color: Colors.textAppColor,
    },
    dropdownPlaceholderText: {
        color: Colors.textAppColor,
    },
});
