import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors, SF } from "../../utils";
type DropdownItem = {
    label: string;
    value: string;
};

type CustomDropdownProps = {
    data: DropdownItem[];
    multiple?: boolean;
    visible: boolean;
    selectedData?: string[] | string | null;
    onChange: (selected: string[] | string | null) => void;
    onClose: () => void;
    title?: string;
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    data,
    multiple = false,
    visible,
    selectedData,
    onChange,
    onClose,
    title = "Select Item",
}) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    useEffect(() => {
        if (multiple) {
            setSelectedValues((selectedData as string[]) || []);
        } else if (selectedData) {
            setSelectedValues([selectedData as string]);
        } else {
            setSelectedValues([]);
        }
    }, [selectedData, multiple]);

    const toggleSelect = (value: string) => {
        if (multiple) {
            setSelectedValues((prev) =>
                prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
            );
        } else {
            setSelectedValues([value]);
        }
    };

    const handleDone = () => {
        onChange(multiple ? selectedValues : selectedValues[0] || null);
        onClose();
    };

    return (
        <Modal onRequestClose={onClose} visible={visible} transparent animationType="slide" >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{title}</Text>

                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.dropdownItem,
                                ]}
                                onPress={() => toggleSelect(item.value)}
                            >
                                <Icon
                                    name={
                                        multiple
                                            ? selectedValues.includes(item.value)
                                                ? "checkbox-marked"
                                                : "checkbox-blank-outline"
                                            : selectedValues.includes(item.value)
                                                ? "radiobox-marked"
                                                : "radiobox-blank"
                                    }
                                    size={SF(24)}
                                    color={Colors.themeColor}
                                    style={styles.checkIcon}
                                />
                                <Text style={styles.itemText}>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center" },
    modalContent: { backgroundColor: "white", padding: 15, flex: 1 },
    title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
    item: { paddingVertical: 10 },
    itemText: { fontSize: 16, color: "#333" },
    selectedItem: { backgroundColor: "#e0f7fa" },
    selectedText: { color: "#00796b", fontWeight: "600" },
    doneButton: {
        marginTop: 10,
        backgroundColor: "#00796b",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    doneText: { color: "white", fontWeight: "600", fontSize: 16 },
    dropdownItem: { flexDirection: "row", alignItems: "center", paddingVertical: SF(12), },
    checkIcon: { marginRight: 4 },
});

export default CustomDropdown;
