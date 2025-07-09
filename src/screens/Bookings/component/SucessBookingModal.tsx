import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { boxShadow, Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, ImageLoader, Spacing, VectoreIcons } from '../../../component';
import imagePaths from '../../../assets/images';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../../navigation/RouteName';


type SucessBookingModalProps = {
    modalVisible: boolean;
    closeModal: () => void;
    submitButton: () => void;
};
const SucessBookingModal: React.FC<SucessBookingModalProps> = ({
    modalVisible = true,
    closeModal,
    submitButton
}) => {
    const navigation = useNavigation<any>();
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
                    <View style={styles.headingContainer}>
                        <VectoreIcons
                            icon='AntDesign'
                            name='checkcircle'
                            size={SF(75)}
                            color={Colors.successColor}
                        />
                        <AppText style={styles.heading}>Booking Successful !</AppText>
                    </View>
                    <Spacing space={SH(20)} />
                    <Pressable style={styles.serviceContainer}>
                        <View style={styles.header}>
                            <View style={[styles.imageWrapper, boxShadow]}>
                                <ImageLoader source={imagePaths.user} resizeMode="cover" mainImageStyle={styles.logo} />
                            </View>
                            <View style={styles.infoContainer}>
                                <AppText style={styles.text}>Haircut + Beard </AppText>
                                <AppText style={styles.price}>{`$1893`}</AppText>
                                <AppText style={styles.dateTime}>{`8:00 am - 8:30 am`}</AppText>
                                <AppText style={styles.withText}>{`With Juana`}</AppText>
                            </View>
                        </View>
                    </Pressable>

                    <Spacing space={SH(70)} />
                    <Buttons
                        onPress={() => {
                            submitButton()
                        }}
                        title='View Booking'
                    />
                    <Spacing space={SH(8)} />
                </View>
            </View>
        </Modal>
    );
};

export default SucessBookingModal;

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
        color: Colors.successColor,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(20),
        textAlign: 'center',
        marginTop: SH(15)
    },
    headingContainer: { alignItems: "center" },

    crossIcon: {
        position: 'absolute',
        right: 4,
        top: 4,
        padding:5,
        zIndex:99999,
    },

    serviceContainer: {
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
        padding: SW(15),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        width: SF(120),
        height: SF(127),
        borderRadius: SF(20),
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

    text: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(16),
        maxWidth: '80%',
    },
    dateTime: {
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(10),
        maxWidth: '80%',
        marginTop: SH(6)
    },
    withText: {
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
        maxWidth: '80%',
        marginTop: SH(6)
    },

    price: {
        color: Colors.themeColor,
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(16),
        maxWidth: '80%',
        marginTop: SH(6)
    },

});
