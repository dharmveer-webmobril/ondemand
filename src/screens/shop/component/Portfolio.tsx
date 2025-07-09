import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import React, { FC } from 'react';
import { boxShadowlight, Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, ImageLoader, VectoreIcons } from '../../../component';
import imagePaths from '../../../assets/images';
import LinearGradient from 'react-native-linear-gradient';

const teamMember = [
    { id: 1, name: 'Juana', img: imagePaths.barber1 },
    { id: 2, name: 'Lynch', img: imagePaths.barber4 },
    { id: 3, name: 'Zachary', img: imagePaths.barber2 },
    { id: 4, name: 'Scoutc', img: imagePaths.barber1 },
];
interface servicesInterface {

}
const SeparatorComponent = () => <View style={styles.itemSepearator} />;
const Portfolio: FC<servicesInterface> = ({ }) => {

    const renderItem = (item: any, index: number) => (
        <View style={[styles.portfolioItem, boxShadowlight]}>
            <ImageLoader source={item.img} resizeMode='contain' mainImageStyle={styles.img} />
            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.showdowView}
                colors={[
                    '#66666600',
                    '#3D3D3DB2',
                ]}
            >
                <AppText style={styles.heartCount}>
                   <VectoreIcons name='hearto' icon='AntDesign' size={SF(11)} color={Colors.bgwhite} />  5
                </AppText>
            </LinearGradient>
        </View>
    );
    return (
        <View style={styles.container}>
            {
                teamMember.map((item, index) => {
                    return renderItem(item, index)
                })
            }
        </View>
    );
};
export default Portfolio;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: '8%'
    },
    listContent: {
        paddingVertical: SH(10),
    },
    portfolioItem: {
        alignItems: "center",
        width: '49%',
        height: SF(155),
        marginBottom: '2%',
        borderRadius: SW(10)
    },
    img: {
        height: '100%',
        width: '100%',
        borderRadius: SW(10)
    },
    showdowView: {
        height: "100%",
        width: '100%',
        zIndex: 9999,
        position: 'absolute',
        borderRadius: SW(10)
    },
    serviceTitle: {
        fontSize: SF(9),
        fontFamily: Fonts.MEDIUM,
        color: Colors.textHeader,
    },
    itemSepearator: {
        width: SW(10),
    },
    heartCount: {
        fontSize: SF(10),
        color: '#ffffff',
        fontFamily: Fonts.REGULAR,
        position:"absolute",
        bottom:10,
        left:10
    }
});
