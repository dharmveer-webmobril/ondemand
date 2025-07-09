import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors, SH, SW, Fonts, SF, boxShadow } from '../../utils';
import imagePaths from '../../assets/images';
import { AppHeader, AppText, Container, ImageLoader, Spacing } from '../../component';
import { useNavigation } from '@react-navigation/native';
import StarRating from 'react-native-star-rating-widget';
import RouteName from '../../navigation/RouteName';

const nearByData = [
    {
        image: imagePaths.electrical,
        name: 'Richar Kandowen',
        id: 1,
        rating: 4.5,
        ratingCount: 450,
        location: 'Ikeja, Nigeria',
        price: 80,
    },
    {
        image: imagePaths.plumb_img,
        name: 'Palmcedar Cleaning',
        id: 2,
        rating: 4.5,
        ratingCount: 450,
        location: 'Ikeja, Nigeria',
        price: 80,
    },
];

const ServiceList: React.FC = () => {
    const navigation = useNavigation<any>();

    const renderItem = ({ item }: { item: any }) => (
        <Pressable onPress={() => navigation.navigate(RouteName.SERVICE_DETAILS)} style={styles.serviceContainer}>
            <View style={styles.header}>
                <View style={[styles.imageWrapper, boxShadow]}>
                    <ImageLoader source={item.image} resizeMode="cover" mainImageStyle={styles.logo} />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.titleContainer}>
                        <AppText numberOfLines={1} style={styles.text}>{item.name}</AppText>
                        <Image source={imagePaths.verified_star} resizeMode="contain" style={styles.verifiedIcon} />
                    </View>
                    <View style={styles.ratingContainer}>
                        <StarRating starSize={SF(16)} rating={item.rating} onChange={() => { }} starStyle={{ marginHorizontal: 0 }} />
                        <AppText style={styles.ratingText}>{item.rating}</AppText>
                    </View>
                </View>
            </View>
            <Spacing space={10} />
            <View style={styles.locationContainer}>
                <Image source={imagePaths.service_loc} style={styles.icon} />
                <AppText style={styles.locationText}>{item.location}</AppText>
                <AppText style={styles.dotText}>•</AppText>
                <AppText style={styles.closedText}>Closed</AppText>
            </View>
            <Spacing space={5} />
            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Image source={imagePaths.money} style={styles.icon} />
                    <AppText style={styles.priceText}>Starts @ ${item.price}/hr</AppText>
                    <View style={styles.durationContainer}>
                        <AppText style={styles.dotText}>•</AppText>
                        <Image source={imagePaths.ClockClockwise} style={styles.icon} />
                        <AppText style={styles.closedText}>1.2 hrs</AppText>
                    </View>
                </View>
            </View>
        </Pressable>
    );

    return (
        <Container statusBarColor={Colors.white}>
            <AppHeader
                headerTitle='Service Provider'
                onPress={navigation.goBack}
                Iconname='arrowleft'
                headerStyle={styles.headerStyle}
                titleStyle={styles.headerTitleStyle}
            />
            <FlatList
                contentContainerStyle={styles.flatListContainer}
                data={nearByData}
                keyExtractor={(item) => `${item.id}`}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsHorizontalScrollIndicator={false}
            />
        </Container>
    );
};

const styles = StyleSheet.create({
    flatListContainer: {
        paddingBottom: SH(10),
    },
    separator: {
        height: SH(15),
        backgroundColor: Colors.white,
    },
    serviceContainer: {
        marginHorizontal: SW(20),
        backgroundColor: '#EEF6F9',
        borderRadius: 10,
        padding: SW(15),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        width: SW(52),
        height: SW(52),
        borderRadius: SW(52) / 2,
        overflow: 'hidden'
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SW(10),
    },
    text: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(15),
        maxWidth: '80%',
    },
    verifiedIcon: {
        width: SW(16),
        height: SW(16),
        marginLeft: SW(6),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SH(5),
        marginLeft: SW(8),

    },
    ratingText: {
        color: Colors.textAppColor,
        fontFamily: Fonts.REGULAR,
        marginLeft: SW(5),
        fontSize: SF(12),
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: SF(15),
        height: SF(15),
        resizeMode: 'contain',
        tintColor: Colors.textAppColor,
    },
    locationText: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
        marginLeft: SW(5),
    },
    dotText: {
        fontSize: SF(20),
        marginHorizontal: SW(3),
        color: Colors.gray2,
    },
    closedText: {
        color: Colors.gray2,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
    },
    footer: {
        flexDirection: 'row',   
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        color: Colors.textAppColor,
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
        marginLeft: SW(5),
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SW(10),
    },
    headerStyle: {
        backgroundColor: Colors.bgwhite,
        marginVertical: SH(10),
        marginHorizontal: 10,
        marginBottom: 20
    },
    headerTitleStyle: {
        color: Colors.textHeader,
        fontSize: SF(18),
    },
});

export default ServiceList;