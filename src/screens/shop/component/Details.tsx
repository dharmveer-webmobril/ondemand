import { View, Text, StyleSheet, Keyboard, Image, TouchableOpacity } from 'react-native';
import React, { FC } from 'react';
import { Colors, Fonts, SF, SH, SW } from '../../../utils';
import { AppText, Buttons, Divider, ImageLoader, Spacing, VectoreIcons } from '../../../component';
import imagePaths from '../../../assets/images';
import AvailTeamMember from './AvailTeamMember';
import RouteName from '../../../navigation/RouteName';
import { useNavigation } from '@react-navigation/native';


interface servicesInterface {

}
interface ListRowItemProps {
    title: string;
    onPress?: () => void;
}


const ListRowItem: React.FC<ListRowItemProps> = ({ title, onPress }) => {
    return (
        <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7} onPress={onPress}>
            <AppText style={styles.itemText}>{title}</AppText>
            <VectoreIcons
                icon="AntDesign"
                name="right"
                size={SF(12)}
                color={Colors.lightGraytext}
            />
        </TouchableOpacity>
    );
};
const Details: FC<servicesInterface> = ({ }) => {
    const navigation = useNavigation<any>();
    return (
        <View style={styles.container}>
            <ImageLoader source={imagePaths.map_img} mainImageStyle={styles.mapImage} resizeMode='contain' />
            <View style={styles.boottomView}>
                <AppText style={styles.subHeader}>About Us</AppText>
                <AppText style={styles.abouttxt}>Viverra lobortis bibendum gravida tortor nulla dolor pharetra. Erat parturient vel eu lectus sit. Suspendisse scelerisque egetnon iaculis consectetur dolor. Uteget malesuada est gravida Mattis justo tincidunt mi felis. Aquis nulla eget neque. Adipiscingeu ultrices sodales luctus. Lorem mauris sem sollicitudin semest non mi. Nuncaugue egestas duis habitasse molestie sedet. Amet ultricies nunc tellus lectus dolorvel.</AppText>
                <Spacing space={SH(20)}/>
                <AppText style={styles.subHeader}>Contact & Business Hours</AppText>
                <Divider color='#3D3D3D40' marginTop={SH(5)} height={0.5} />
                <View style={styles.contaictUsView}>
                    <View style={styles.phoneimg_phonenumberView}>
                        <Image source={imagePaths.phone_img} style={styles.phoneimg} />
                        <AppText style={[styles.subHeader]}> (3945687456)</AppText>
                    </View>
                    <Buttons
                        buttonStyle={styles.callbutton}
                        textColor={Colors.textWhite}
                        buttonTextStyle={styles.callbuttontxt}
                        isExtraBoxShadow={false}
                        title={'Call'}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    />
                </View>
                <Spacing space={SH(25)} />
                <AppText style={[styles.subHeader]}>Available Team Member</AppText>
                <AvailTeamMember selectedId={1} />
                <Spacing space={SH(10)} />
                <ListRowItem title="Service Fee & Policy" onPress={() => navigation.navigate(RouteName.BOOKING_PRI_POLI, { title: "Service Fee & Policy" })} />
                <ListRowItem title="Payment & Cancellation Policy" onPress={() => navigation.navigate(RouteName.BOOKING_PRI_POLI, { title: "Payment & Cancellation Policy" })} />
                <ListRowItem title="Report" onPress={() => navigation.navigate(RouteName.REPORT_SHOP)} />
       
            </View>
        </View>
    );
};
export default Details;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapImage: {
        height: SH(153),
        width: "100%"
    },
    boottomView: {
        paddingHorizontal: '6%',
        marginTop: SH(12)
    },
    subHeader: {
        color: '#404040',
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12)
    },
    abouttxt: {
        color: Colors.textHeader,
        fontFamily: Fonts.REGULAR,
        fontSize: SF(10),
        marginTop: SH(8)
    },
    contaictUsView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        marginTop: SH(8)
    },
    callbutton: {
        width: SW(40),
        height: SH(25),
        borderRadius: SF(5)
    },
    callbuttontxt: {
        fontSize: SF(10)
    },
    phoneimg: { height: SW(18), width: SW(18) },
    phoneimg_phonenumberView: { flexDirection: "row", alignItems: 'center' },
    itemContainer: {
        paddingBottom: SH(10),
        marginBottom: SH(10),
        paddingHorizontal: SW(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.8,
        borderBottomColor: '#3D3D3D40',
    },
    itemText: {
        fontSize: SF(10),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
    },
});
