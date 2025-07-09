import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { AppText, Divider } from '../../../component';
import { SF, SH, SW, Fonts, messagesData } from '../../../utils';

interface Props {
    onClose: () => void;
    menuOptions: any
}

const ChatDropdownMenu: React.FC<Props> = ({ onClose, menuOptions }) => {
    return (
        <View style={styles.dropdown}>
            {menuOptions.map((item: any, index: number) => (
                <React.Fragment key={item.id}>
                    <TouchableOpacity style={styles.menuItem} onPress={onClose}>
                        <Image source={item.icon} style={styles.menuIcon} />
                        <AppText style={styles.menuText}>{item.title}</AppText>
                    </TouchableOpacity>
                    {index !== menuOptions.length - 1 && <Divider color="#DEDEDE" />}
                </React.Fragment>
            ))}
        </View>
    );
};

export default ChatDropdownMenu;

const styles = StyleSheet.create({
    dropdown: {
        position: 'absolute',
        top: SH(25),
        right: SW(5),
        backgroundColor: '#fff',
        borderRadius: SF(6),
        paddingVertical: 6,
        width: SW(110),
        zIndex: 999999999,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SF(15),
        paddingVertical: SF(12),
        zIndex: 999999999,
    },
    menuIcon: {
        height: SF(10),
        width: SF(10),
        zIndex: 999999999,
    },
    menuText: {
        fontSize: SF(8),
        marginLeft: SF(8),
        color: '#000',
        fontFamily: Fonts.Chivo_Medium,
        zIndex: 999999999,
    },
});
