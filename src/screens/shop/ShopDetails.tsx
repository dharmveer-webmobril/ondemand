import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet,  TouchableOpacity, View } from 'react-native';
import {  AppText, Container, ImageLoader, Spacing, VectoreIcons } from '../../component';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import imagePaths from '../../assets/images';
import {  useNavigation, useRoute } from '@react-navigation/native';
import { ConfirmBookingTypeModal, Details, Portfolio, Reviews, Services } from './component';
import RouteName from '../../navigation/RouteName';
import { ConfirmBookingModal } from '../Bookings/component';

interface shopProps { }
const shopDetailTabs = [
    { id: 1, name: 'Services' },
    { id: 2, name: 'Reviews' },
    { id: 3, name: 'Portfolio' },
    { id: 4, name: 'Details' },
];

const ShopDetails: React.FC<shopProps> = () => {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTabs] = useState<string>('services');
    const [confirmBookingTypeModal, setConfirmBookingTypeModal] = useState<boolean>(false);
    const [forwhomCheck, setForwhomCheck] = useState(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const route = useRoute<any>();
    let bookingType = route?.params?.bookingType;

     
    const btnBookService = () => {
        bookingType === 'immediate' ? setModalVisible(true) : setConfirmBookingTypeModal(true)
    }

    const getHeaderContainerStyle = () => {
        return {
            ...styles.headerContainer,
            borderBottomWidth: activeTab === 'details' ? 0.6 : 0,
        };
    };

    return (
        <Container isAuth>
            <Spacing space={SH(20)}/>
            <ConfirmBookingModal
                forwhomCheck={forwhomCheck}
                setForwhomCheck={() => { setForwhomCheck(!forwhomCheck) }}
                modalVisible={modalVisible}
                closeModal={() => {
                    setModalVisible(false);
                }}
                btnSubmit={() => {
                    setModalVisible(false);
                    if (forwhomCheck) {
                        setTimeout(() => {
                            navigation.navigate(RouteName.ADD_OTHER_PERSON_DETAIL)
                        }, 200);
                    } else {
                        setTimeout(() => {
                            // navigation.navigate(RouteName.PAYMENT_SCREEN)
                            navigation.navigate(RouteName.SELECT_ADDRESS,{prevType:'forSelf'})
                        }, 200);
                    }
                }}
            />
            <StatusBar
                barStyle={'dark-content'}
            />
            <Spacing />
            <View style={getHeaderContainerStyle()}>
                <TouchableOpacity onPress={() => {
                    navigation.goBack();
                }}>
                    <VectoreIcons
                        icon="FontAwesome"
                        name={'angle-left'}
                        size={SF(30)}
                        color={Colors.textHeader}
                    />
                </TouchableOpacity>
                {activeTab === 'details' ? <View style={styles.shopTextBlockDetails}>
                    <AppText style={styles.shopTitle}>
                        WM Barbershop <AppText style={styles.shopCount}>(250)</AppText>
                    </AppText>
                </View> : ''}
            </View>

            <ScrollView
                bounces={false}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {activeTab !== 'details' && <>
                    <View style={styles.bannerContainer}>
                        <ImageLoader
                            source={imagePaths.barber5}
                            mainImageStyle={styles.bannerImage}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.shopInfoContainer}>
                        <View style={styles.shopTextBlock}>
                            <AppText style={styles.shopTitle}>
                                WM Barbershop <AppText style={styles.shopCount}>(250)</AppText>
                            </AppText>
                            <AppText style={styles.shopAddress}>
                                1893 Cheshire Bridge Rd Ne, 30325 {'\n'}Home Service
                            </AppText>
                        </View>
                        <View style={styles.iconsBlock}>
                            <VectoreIcons
                                icon="Feather"
                                name="share-2"
                                size={SF(20)}
                                color={Colors.black}
                            />
                            <VectoreIcons
                                icon="FontAwesome"
                                name="heart-o"
                                size={SF(20)}
                                color={Colors.black}
                                style={styles.heartIcon}
                            />
                        </View>
                    </View>
                </>}
                {/* tabs=========== */}
                <View style={styles.tabBar}>
                    {
                        shopDetailTabs.map((item, index) => {
                            return <Pressable onPress={() => { setActiveTabs(item.name.toLowerCase()); }} key={index.toString() + 'tabs'}>
                                <AppText style={activeTab === item.name.toLowerCase() ? styles.activeTab : styles.inactiveTab}>{item.name}</AppText>
                            </Pressable>;
                        })
                    }
                </View>
                {activeTab !== 'details' && <Spacing />}
                {activeTab === 'services' && <Services onClick={() => btnBookService()} />}
                {activeTab === 'reviews' && <Reviews />}
                {activeTab === 'portfolio' && <Portfolio />}
                {activeTab === 'details' && <Details />}
                {/* pages=========== */}

            </ScrollView>
            <ConfirmBookingTypeModal
                modalVisible={confirmBookingTypeModal}
                submitButton={() => { }}
                closeModal={() => { setConfirmBookingTypeModal(false) }}
            />
        </Container>
    );
};

export default ShopDetails;

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.bgwhite,
        paddingHorizontal: SW(30),
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: "9%",
        paddingBottom: SH(10),
        borderColor: '#3D3D3D40',
    },
    scrollContainer: {
        paddingBottom: SH(30),
    },
    bannerContainer: {
        width: '90%',
        height: SF(200),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: -20,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    shopInfoContainer: {
        backgroundColor: '#0000000D',
        paddingVertical: SH(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '7%',
    },
    shopTextBlock: {
        width: '66%',
    },
    shopTextBlockDetails: {
        width: '66%',
        marginLeft: 20,
    },
    shopTitle: {
        fontSize: SF(14),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.txtAppDarkColor,
    },
    shopCount: {
        fontSize: SF(10),
        fontFamily: Fonts.MEDIUM,
        color: Colors.txtAppDarkColor,
    },
    shopAddress: {
        fontSize: SF(10),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.lightGraytext,
        marginTop: 2,
    },
    iconsBlock: {
        width: '25%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    heartIcon: {
        marginLeft: 20,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SH(10),
        backgroundColor: Colors.white,
        borderBottomWidth: 0.7,
        borderColor: '#3D3D3D40',
        paddingHorizontal: '7%',
    },
    activeTab: {
        fontSize: SF(12),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.themeColor,
        textDecorationLine: 'underline',
    },
    inactiveTab: {
        fontSize: SF(12),
        fontFamily: Fonts.MEDIUM,
        color: Colors.txtAppDarkColor,
    },
});
