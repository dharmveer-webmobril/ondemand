import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import { AppText } from '../../component';


type TabTopProps = {
    activeTab: number;
    changeTab: (val: number) => void;
    tabArr?: any[];
    height?: number;
};
const TabTop: React.FC<TabTopProps> = ({ activeTab, changeTab, tabArr = ['My Booking', 'Other Boooking'], height = SH(35) }) => {
    return (
        <View style={[styles.modalView, { height: height, alignItems: 'center' }]}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => { changeTab(1) }} style={activeTab == 1 ? styles.tabac : styles.tab}>
                <AppText style={activeTab == 1 ? styles.textac : styles.text}>{tabArr[0]}</AppText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => { changeTab(2) }} style={activeTab == 2 ? styles.tabac : styles.tab}>
                <AppText style={activeTab == 2 ? styles.textac : styles.text}>{tabArr[1]}</AppText>
            </TouchableOpacity>
        </View>
    );
};

export default TabTop;

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: Colors.bgwhite,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: '#DBDBDB',
        borderRadius: SW(10)
    },

    text: {
        fontFamily: Fonts.MEDIUM, color: Colors.textAppColor, fontSize: SF(12)
    },
    textac: {
        fontFamily: Fonts.MEDIUM, color: Colors.white, fontSize: SF(12)
    },
    tab: { borderRadius: SW(10), backgroundColor: Colors.white, width: '50%', alignItems: 'center', height: "100%", justifyContent: "center" },
    tabac: { borderRadius: SW(10), backgroundColor: Colors.themeColor, width: '50%', alignItems: 'center', height: "100%", justifyContent: "center" },

});
