import React from "react";
import {
    Modal,
    View,
    StyleSheet,
    Platform,
} from "react-native";
import { SF, Colors, SW, SH } from "../utils";
import VectorIcon from "./VectoreIcons";
import Buttons from "./Button";
import AppText from "./AppText";

interface SweetaelertModalProps {
    visible: boolean;
    message: string;
    onClose?: () => void;
    onOk?: () => void;
    onCancel?: () => void;
    isConfirmType: 'info' | 'confirm' | 'delete',
    isOkButtonLoading?: boolean
}

// ...existing code...

const SweetaelertModal: React.FC<SweetaelertModalProps> = ({
    visible,
    message = "Example message",
    onCancel,
    onOk,
    isConfirmType = 'info',
    isOkButtonLoading = false
}) => {
    // Show Cancel button only for 'confirm' and 'delete'
    const isConfirmBox = isConfirmType === 'confirm' || isConfirmType === 'delete';

    // Choose icon and color based on type
    let iconName = 'checkcircle';
    let iconColor = Colors.themeColor;
    let iconSet: 'AntDesign' | 'MaterialIcons' = 'AntDesign';

    if (isConfirmType === 'confirm') {
        iconName = 'questioncircle';
        iconColor = Colors.ratingColor; // Use your warning color
        iconSet = 'AntDesign';
    } else if (isConfirmType === 'delete') {
        iconName = 'delete';
        iconColor = Colors.red; // Use your error color
        iconSet = 'MaterialIcons';
    } else if (isConfirmType === 'info') {
        iconName = 'warning';
        iconColor = Colors.ratingColor;
        iconSet = 'AntDesign';
    }

    return (
        <Modal animationType="slide" transparent={true} visible={visible}>
            <View style={styles.setbgcolorgrsay}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {/* Icon Section */}
                        <View style={styles.setroundcenter}>
                            <View style={[styles.checkiconright, { borderColor: iconColor }]}>
                                <VectorIcon
                                    icon={iconSet}
                                    style={[styles.setbackgroundicon, { color: iconColor }]}
                                    name={iconName}
                                    size={SF(40)}
                                />
                            </View>
                        </View>

                        {/* Message Section */}
                        <View style={styles.registertextset}>
                            <AppText style={styles.settext}>{message}</AppText>
                        </View>

                        <View style={styles.buttonminview} >
                            <View style={styles.setokbutton}>
                                <Buttons title={'Ok'}
                                      isBordered
                                    isLoading={isOkButtonLoading}
                                    onPress={() => { onOk && onOk() }}
                                />
                            </View>
                            {isConfirmBox && <View style={styles.setokbutton}>
                                <Buttons title={'Cancel'}
      isBordered
                                    onPress={() => { onCancel && onCancel() }}
                                />
                            </View>}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SweetaelertModal;

const styles = StyleSheet.create({
    setbgcolorgrsay: {
        flex: 1,
        backgroundColor: Colors.grayColor,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        opacity: Platform.OS === "ios" ? 2 : 0.9,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        backgroundColor: Colors.bgwhite,
        borderRadius: SW(7),
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingVertical: SH(20),
        width: "90%",
    },
    setroundcenter: {
        flexDirection: "row",
        justifyContent: "center",
    },
    checkiconright: {
        borderWidth: SW(3),
        height: SW(60),
        width: SW(60),
        borderRadius: SW(30),
        flexDirection: "row",
        borderColor: Colors.themeColor,
        alignItems: "center",
        justifyContent: "center",
    },
    setbackgroundicon: {
        color: Colors.themeColor,
    },
    registertextset: {
        paddingTop: SH(20),
        marginBottom: SH(15),
        flexDirection: "row",
        justifyContent: "center",
    },
    settext: {
        color: Colors.black,
        fontSize: SF(20),
        paddingHorizontal: SW(20),
        textAlign: "center",
    },
    buttonminviewdettwo: {
        flexDirection: "row",
        justifyContent: "center",
        paddingTop: SH(20),
    },

    buttonminview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SH(40),
        paddingTop: SH(20),
        alignSelf: 'center'
    },
    setokbutton: {
        width: '47%',
        marginHorizontal: '1.5%'
    },
});