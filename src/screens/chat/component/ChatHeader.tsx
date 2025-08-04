import React, {useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppText, ImageLoader, Spacing, SweetaelertModal, VectoreIcons } from '../../../component';
import {   Colors, Fonts, SF, SH, SW, imagePaths } from '../../../utils';
 
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../../navigation/RouteName';
import ChatMenu from './ChatDropdownMenu';

interface ChatHeaderProps {
    isOpenMenu: boolean;
    closeMenu: () => void;
    openMenu: () => void;
    otherDetails: {
        name: string;
        [key: string]: any;
    };
    myDetails: any;
    clearMessages:any
}

const ChatHeader: React.FC<ChatHeaderProps> = ({  otherDetails, clearMessages  }) => {
    const navigation = useNavigation<any>();
    const [isDeletePopup, setIsDeletePopup] = useState(false);
 
    const onPressMenuOption = (type: string) => {
        console.log(type, 'typetype');
        switch (type) {
            case 'mute':
                // Handle mute
                break;
            case 'delete':
                setIsDeletePopup(true)
                break;
            case 'feedback':
                // Handle feedback
                break;
        }

    }

    const deleteMsg = async() => {
        await clearMessages(); 
        setIsDeletePopup(false)
    }
    
 


    return (
        <>
            <SweetaelertModal
                message='Are you sure want to delete ?'
                visible={isDeletePopup}
                isConfirmType={'delete'}
                onCancel={() => { setIsDeletePopup(false) }}
                onOk={() => { deleteMsg() }}
            />
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(RouteName.INBOX_SCREEN)}>
                    <VectoreIcons
                        icon="FontAwesome"
                        name={'angle-left'}
                        size={SF(30)}
                        color={Colors.textHeader}
                    />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.avatarWrapper}>

                        <ImageLoader
                            source={{ uri: otherDetails.image || imagePaths.defaultUser }}
                            resizeMode="cover"
                            mainImageStyle={styles.avatarImage}
                        />

                    </View>
                    <View style={styles.nameContainer}>
                        <AppText style={styles.userName}>{otherDetails?.name ?? 'User'}</AppText>
                        <AppText style={styles.lastSeen}>Last seen 5 min ago</AppText>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity>
                        <VectoreIcons
                            icon="MaterialIcons"
                            name={'call'}
                            size={SF(24)}
                            color={Colors.themeColor}
                        />
                    </TouchableOpacity>
                    <Spacing horizontal space={10} />
                    <View>
                        <ChatMenu
                            onSelect={(value) => {onPressMenuOption(value)}}
                        />
                    </View>
                </View>
            </View>
        </>
    );
};

export default ChatHeader;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SW(20),
        paddingVertical: SH(10),
        borderBottomWidth: 1,
        borderColor: Colors.textAppColor + '20',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SW(25),
        flex: 1,
    },
    avatarWrapper: {
        height: SF(50),
        width: SF(50),
        borderRadius: SF(25),
        overflow: 'hidden',
        borderWidth: 1,
    },
    avatarImage: {
        height: '100%',
        width: '100%',
    },
    nameContainer: {
        marginLeft: SW(8),
        flex: 1,
    },
    userName: {
        fontFamily: Fonts.Chivo_Medium,
        fontSize: SF(14),
        color: Colors.textAppColor,
    },
    lastSeen: {
        fontFamily: Fonts.Chivo_Medium,
        fontSize: SF(10),
        color: Colors.lightGraytext,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        zIndex: 99999999,
    },
});
