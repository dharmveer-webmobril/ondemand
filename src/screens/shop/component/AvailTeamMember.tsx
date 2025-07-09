import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import React, { FC } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, ImageLoader, VectoreIcons } from '../../../component';
import imagePaths from '../../../assets/images';

const teamMember = [
    { id: 1, name: 'Juana', img: imagePaths.electrical, activeStatus: true },
    { id: 2, name: 'Lynch', img: imagePaths.user, activeStatus: true },
    { id: 3, name: 'Zachary', img: imagePaths.user1, activeStatus: true },
    { id: 4, name: 'Scoutc', img: imagePaths.user2, activeStatus: false },
    { id: 5, name: 'Charles', img: imagePaths.user4, activeStatus: false },
    { id: 6, name: 'Beard Trim', img: imagePaths.user_img, activeStatus: false },
    { id: 7, name: 'Hair Color', img: imagePaths.electrical, activeStatus: false },
];
interface servicesInterface {
    selectedId?: number
}
const SeparatorComponent = () => <View style={styles.itemSepearator} />;
const AvailTeamMember: FC<servicesInterface> = ({ selectedId }) => {

    const renderItem = ({ item }: any) => (
        <View style={styles.serviceItem}>
            <View style={styles.imgContainer}>
                <ImageLoader source={item.img} resizeMode='cover' mainImageStyle={[styles.img,{opacity:!item.activeStatus?0.4:1}]} />
            </View>
            <AppText numberOfLines={2} style={styles.serviceTitle}>{item.name}</AppText>
            {selectedId == item.id && <View style={styles.tickIcon}><VectoreIcons icon='AntDesign' name='checkcircle' color='green' size={SF(18)} /></View>}
        </View>
    );
    return (
        <FlatList
            data={teamMember}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            horizontal
            contentContainerStyle={styles.listContent}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={SeparatorComponent}
        />
    );
};
export default AvailTeamMember;

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: SH(10),
    },
    serviceItem: {
        backgroundColor: Colors.white,
        marginBottom: SH(10),
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: SW(80)
    },
    imgContainer: { 
        height: SW(50), 
        width: SW(50), 
        borderRadius: SW(25), 
        overflow: "hidden" 
    },
    img: { 
        height: '100%', 
        width: '100%',
        borderRadius: SW(25),  
    },
    serviceTitle: {
        fontSize: SF(9),
        fontFamily: Fonts.MEDIUM,
        color: Colors.textHeader,
        marginTop:2
    },
    itemSepearator: {
        width: SW(15),
    },
    tickIcon:{ position: "absolute", top: -8, right: -8 }
});
