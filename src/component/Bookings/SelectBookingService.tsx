import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    Dimensions,
    StatusBar,
    SafeAreaView,
    Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors, SF, SH } from "../../utils";
import { useTranslation } from "react-i18next";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

type DropdownItem = any;

type SelectBookingServiceModalProps = {
    data: DropdownItem[];
    selectedData: string[];
    modalTitle?: string;
    onChange?: (selected: string[] | string | null) => void;
    visible: boolean;
    onClose?: () => void;
};

const SelectBookingService: React.FC<SelectBookingServiceModalProps> = ({
    data = [],
    selectedData = [],
    modalTitle = "Select Items",
    onChange = () => { },
    onClose = () => { },
    visible = false
}) => {
    const { t } = useTranslation();

    console.log('selectedDataselectedData', selectedData);


    const renderItem = ({ item }: { item: DropdownItem }) => {
        const selectedItem = selectedData?.find((v: any) => v._id === item._id);
        return <TouchableOpacity
            style={[styles.dropdownItem,
            ]}
            onPress={() => {
                onChange(item)
            }}
        >
            <Icon
                name={
                    selectedItem
                        ? "checkbox-marked"
                        : "checkbox-blank-outline"

                }
                size={SF(24)}
                color={Colors.themeColor}
                style={styles.checkIcon}
            />
            <Text style={styles.itemText}>{item.serviceName}</Text>
        </TouchableOpacity>
    }



    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={() => { onClose(); }}
        >
            <SafeAreaView style={styles.modalContainer}>
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
                    backgroundColor={Colors.bgwhite}
                />
                {/* Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => { onClose(); }}>
                        <Icon name="arrow-left" size={24} color={Colors.textAppColor} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* List */}
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    style={styles.flatList}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
                />


            </SafeAreaView>
        </Modal>
    );
};



const styles = StyleSheet.create({
    container: { width: "100%" },
    dropdownTrigger: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SF(10), paddingHorizontal: SF(10), paddingLeft: SF(20), borderWidth: 1, borderColor: Colors.textAppColor, borderRadius: SF(8), backgroundColor: Colors.bgwhite,
    },
    chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: SF(2.5), marginHorizontal: 3, borderRadius: 5, marginVertical: 2 },
    chipText: { marginRight: 4 },
    cross: { fontWeight: "bold" },
    modalContainer: { flex: 1, backgroundColor: Colors.bgwhite, },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee", },
    modalTitle: { fontSize: SF(18), fontWeight: "bold", color: "#333", textAlign: "center", flex: 1, },
    flatList: { flex: 1, paddingHorizontal: 20, },
    dropdownItem: { flexDirection: "row", alignItems: "center", paddingVertical: SF(12), },
    itemText: { marginLeft: 8, color: "#333", fontSize: SF(16) },
    selectedItemBg: { backgroundColor: "#f0f0f0" },
    checkIcon: { marginRight: 8 },
    doneButton: { backgroundColor: Colors.themeColor, paddingVertical: SF(10), marginHorizontal: 20, marginBottom: SH(20), borderRadius: 8, alignItems: "center", },
    doneButtonText: { color: Colors.bgwhite, fontSize: SF(16), fontWeight: "bold", },
});

export default React.memo(SelectBookingService);