import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, SH, SW, Fonts, SF, } from '../../utils';
import { AppHeader, AppText, Buttons, Container, ImageLoader, VectoreIcons } from '../../component';
import { useNavigation } from '@react-navigation/native';
import { BookingServiceItem, TabTop } from './component';
import imagePaths from '../../assets/images';


const BookingDetails: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTabs] = useState<number>(1);



  return (
    <Container statusBarColor={Colors.white} >
      <AppHeader
        headerTitle='WM Barbershop'
        onPress={() => { navigation.goBack() }}
        Iconname="arrowleft"
        headerStyle={styles.headerStyle}
        titleStyle={styles.headerTitleStyle}
      />
      <ScrollView>
        <ImageLoader source={imagePaths.map_img} mainImageStyle={styles.mapImage} resizeMode='cover' />

        <View style={styles.shopInfoContainer}>
          <View style={styles.shopTextBlock}>
            <AppText style={styles.shopTitle}>
              WM Barbershop <AppText style={styles.shopCount}>with Juana</AppText>
            </AppText>
            <AppText style={styles.shopAddress}>
              1893 Cheshire Bridge Rd Ne, 30325
            </AppText>
          </View>
          <View style={styles.iconsBlock}>
            <VectoreIcons
              icon="Feather"
              name="share-2"
              size={SF(20)}
              color={Colors.black}
            />
          </View>
        </View>

        <View style={styles.serviceContaine}>
          <BookingServiceItem
            subtitles='With Juana'
            time='8:00 am - 8:30 am'
            title='Only Haircut'
            price='$8989'
          />
          <BookingServiceItem
            title='Subtotal'
            price='$8989'
          />
        </View>
      </ScrollView>
      <AppText style={styles.addTipButton}>+ Add Tip</AppText>
      <Buttons
        onPress={() => { }}
        title='Book Again'
        buttonStyle={styles.bookAgainButton}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: Colors.bgwhite,
    marginVertical: SH(10),
    marginBottom: SF(20),
    paddingHorizontal: SW(30)
  },
  headerTitleStyle: {
    color: Colors.textHeader,
    fontSize: SF(18),
  },
  mapImage: {
    height: SH(153),
    width: "100%"
  },
  shopInfoContainer: {
    backgroundColor: '#0000000D',
    paddingVertical: SH(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    paddingHorizontal: '7%',
  },
  shopTextBlock: {
    width: '66%',
  },
  shopTitle: {
    fontSize: SF(14),
    fontFamily: Fonts.SEMI_BOLD,
    color: Colors.txtAppDarkColor,
  },
  shopCount: {
    fontSize: SF(10),
    fontFamily: Fonts.MEDIUM,
    color: Colors.lightGraytext,
  },
  shopAddress: {
    fontSize: SF(10),
    fontFamily: Fonts.MEDIUM,
    color: Colors.lightGraytext,
    marginTop: SH(3),
  },
  iconsBlock: {
    width: '25%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heartIcon: {
    marginLeft: 12,
  },
  serviceContaine: { paddingHorizontal: SW(25), marginTop: SH(15), flex: 1 },
  bookAgainButton: { width: '86%', alignSelf: "center", marginBottom: SH(20) },
  addTipButton: { textAlign: 'center', fontFamily: Fonts.MEDIUM, fontSize: SF(16), marginBottom: SH(20), color: Colors.themeColor }
});

export default BookingDetails;