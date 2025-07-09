import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts, SF, SH } from '../../../utils';
import { AppText } from '../../../component';

interface BookingServiceItemProps {
    title?: string;
    subtitles?: string;
    time?: string;
    price?: string;
}

const BookingServiceItem: React.FC<BookingServiceItemProps> = ({
    title = '',
    subtitles = '',
    time = '',
    price = '',
}) => {
    return (
        <View style={styles.serviceItem}>
            <View>
                <AppText style={styles.serviceTitle}>{title}</AppText>
                {subtitles && <AppText style={styles.serviceSub}>
                    {subtitles}
                </AppText>}
                {time && <AppText style={styles.serviceSub}>
                    {time}
                </AppText>}
            </View>
            <AppText style={styles.price}>{price}</AppText>
        </View>
    );
};

interface Style {
    serviceItem: ViewStyle;
    serviceTitle: TextStyle;
    serviceSub: TextStyle;
    price: TextStyle;
}

const styles = StyleSheet.create<Style>({
    serviceItem: {
        backgroundColor: '#0000000D',
        borderRadius: 10,
        paddingVertical: SH(15),
        paddingHorizontal: '5%',
        marginBottom: SH(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    serviceTitle: {
        fontSize: SF(12),
        fontFamily: Fonts.MEDIUM,
        color: Colors.textAppColor,
    },
    serviceSub: {
        fontSize: SF(10),
        color: Colors.lightGraytext,
        fontFamily: Fonts.MEDIUM,
        marginTop:SH(2)
    },
    price: {
        fontSize: SF(12),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        marginTop:SH(2)
    },
});

export default BookingServiceItem;
