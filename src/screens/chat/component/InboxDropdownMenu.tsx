
import React from 'react';
import { View,  StyleSheet, Image } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { Fonts, imagePaths, SF, SW } from '../../../utils';
import { AppText, Divider, VectoreIcons } from '../../../component';

interface InboxDropdownMenuProps {
    onSelect: (value: 'mute' | 'delete' | 'feedback') => void;
    isBlocked: boolean;
}

const InboxDropdownMenu: React.FC<InboxDropdownMenuProps> = ({ onSelect, isBlocked }) => {
    return (
        <View style={styles.container}>
            <Menu onSelect={onSelect}>
                <MenuTrigger>
                    <VectoreIcons
                        icon='MaterialCommunityIcons'
                        name="dots-vertical" size={24}
                        color="#00788D"
                    />
                </MenuTrigger>
                <MenuOptions customStyles={menuStyles}>
                    <MenuOption value="edit" >
                        <View style={styles.menuItem}>
                            <Image source={imagePaths.delete_icon} style={styles.menuIcon} />
                            <AppText style={styles.menuText}>Edit</AppText>
                        </View>
                        <Divider color="#DEDEDE" />
                    </MenuOption>
                    <MenuOption value="delete">
                        <View style={styles.menuItem}>
                            <Image source={imagePaths.report_icon} style={styles.menuIcon} />
                            <AppText style={styles.menuText}>Delete</AppText>
                        </View>
                        <Divider color="#DEDEDE" />
                    </MenuOption>
                    
                    <MenuOption value="block">
                        <View style={styles.menuItem}>
                            <Image source={imagePaths.block_icon} style={styles.menuIcon} />
                            <AppText style={styles.menuText}>{ isBlocked ? 'Unblock' : 'Block'}</AppText>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        </View>
    );
};

export default InboxDropdownMenu;

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
        paddingRight: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 5
    },
    menuText: {
        fontSize: SF(8),
        marginLeft: SF(8),
        color: '#000',
        fontFamily: Fonts.Chivo_Medium,
        zIndex: 999999999,
    },
    menuIcon: {
        height: SF(10),
        width: SF(10),
        zIndex: 999999999,
    },

});

const menuStyles = {
    optionsContainer: {
        borderRadius: SF(6),
        paddingVertical: 6,
        width: SW(120),
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        marginTop: 30
    },
};
