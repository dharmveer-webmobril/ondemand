import { View, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { boxShadowlight, Colors, Fonts, imagePaths, SF, SH, SW } from '../../utils';
import { AppText, ImageLoader } from '../../component';


interface servicesInterface {
    data: any;
}
const Portfolio: FC<servicesInterface> = ({ data }) => {

    const renderItem = (item: any) => {
        console.log('item.portfolioitem.portfolio', item.portfolio);
        return <View style={[styles.portfolioItem, boxShadowlight]} key={item?._id}>
            <ImageLoader source={item.portfolio ? { uri: item.portfolio } : imagePaths?.no_user_img} resizeMode='cover' mainImageStyle={styles.img} />
        </View>
    }

    return (
        <View style={styles.container}>
            {
                data && data?.length > 0 ? data.map((item: any) => {
                    return renderItem(item)
                })
                    :
                    <View style={styles.emptyContainer}>
                        <AppText style={styles.emptyText}>No Portfolio Available</AppText>
                    </View>
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
        borderRadius: SW(10),
        backgroundColor: Colors.white,
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
        position: "absolute",
        bottom: 10,
        left: 10
    }
    , emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: SH(200) }
    , emptyText: { color: Colors.textHeader }
});
