import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { FC } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons } from '../../../component';
import AvailTeamMember from './AvailTeamMember';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../../navigation/RouteName';

const services = [
    { id: 1, name: 'Haircut + Beard ✈️', price: '$55.00', time: '30m' },
    { id: 2, name: 'Haircut + Beard ✂', price: '$55.00', time: '30m' },
    { id: 3, name: 'Razor', price: '$55.00', time: '25m' },
    { id: 4, name: 'Kids Haircut', price: '$30.00', time: '15m' },
    { id: 5, name: 'Enchantments', price: '$15.00', time: '10m' },
];
interface servicesInterface {
    onClick:()=>void
}
const SeparatorComponent = () => <View style={styles.itemSepearator} />;
const Services: FC<servicesInterface> = ({onClick }) => {
    const navigation = useNavigation<any>();
    const renderItem = ({ item }: any) => (
        <View style={styles.serviceItem}>
            <View>
                <AppText style={styles.serviceTitle}>{item.name}</AppText>
                <AppText style={styles.serviceSub}>Popular Service</AppText>
            </View>
            <View style={styles.flexDir}>
                <View style={styles.rightBlock}>
                    <AppText style={styles.price}>{item.price}</AppText>
                    <AppText style={styles.duration}>{item.time}</AppText>
                </View>
                <Buttons
                    buttonStyle={styles.bookBtn}
                    textColor={Colors.textWhite}
                    isExtraBoxShadow={false}
                    title={'Book'}
                    buttonTextStyle={styles.bookText}
                    onPress={() => {onClick()}}
                />
            </View>
        </View>
    );
    return (
        <>
            <FlatList
                data={services}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={SeparatorComponent}
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.paddingHoriTeamMeme}>

                <AvailTeamMember />
            </View>
        </>
    );
};
export default Services;

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: SH(10),
        paddingHorizontal: SH(25),
    },
    flexDir: { flexDirection: 'row' },
    serviceItem: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingVertical: SH(15),
        paddingHorizontal: '3%',
        marginBottom: SH(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    serviceTitle: {
        fontSize: SF(10),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.lightGraytext,
    },
    serviceSub: {
        fontSize: SF(8),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
    },
    rightBlock: {
        alignItems: 'flex-end',
        marginRight: SW(15),
    },
    price: {
        fontSize: SF(10),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.lightGraytext,
    },
    duration: {
        fontSize: SF(8),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        marginTop: 2,
    },
    bookBtn: {
        backgroundColor: Colors.themeColor,
        alignSelf: 'center',
        width: SF(45),
        height: SF(22),
        borderRadius: SF(5),
        paddingHorizontal: SF(5),
    },
    bookText: {
        color: Colors.white,
        fontSize: SF(10),
        fontFamily: Fonts.MEDIUM,
    },
    itemSepearator: {
        height: 0.6,
        backgroundColor: '#3D3D3D40',
    },
    paddingHoriTeamMeme:{ paddingHorizontal: SW(30) }
});
