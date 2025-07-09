import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  AppHeader,
  AppText,
  Buttons,
  Container,
  VectoreIcons,
} from '../../component'; // Adjust based on your actual paths
import { addressMenuData, Colors, Fonts, goBack, inboxMenuData, navigate, SF, SH, SW } from '../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChatDropdownMenu from '../chat/component/ChatDropdownMenu';
import RouteName from '../../navigation/RouteName';
import { useTranslation } from 'react-i18next';

const addressData = [
  {
    id: '1',
    title: 'My Home',
    address: 'Sophie Nowakowska, Netherlands 12/2231-234 crowkon.poloe',
    phone: '+31 6387 7355',
  },
  {
    id: '2',
    title: 'My Office',
    address: 'Sophie Nowakowska, Netherlands 12/2231-234 crowkon.poloe',
    phone: '+31 6387 7355',
  },
  {
    id: '3',
    title: 'Lorem Ipsum',
    address: 'Sophie Nowakowska, Netherlands 12/2231-234 crowkon.poloe',
    phone: '+31 6387 7355',
  },
  {
    id: '4',
    title: 'Lorem Ipsum',
    address: 'Sophie Nowakowska, Netherlands 12/2231-234 crowkon.poloe',
    phone: '+31 6387 7355',
  },
];

const SelectAddress = () => {
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState(addressData);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const route = useRoute<any>();
  const { prevType } = route.params;

  const renderItem = ({ item }: { item: typeof addressData[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <AppText style={styles.cardTitle}>{item.title}</AppText>
          <AppText style={styles.cardSubtitle}>{item.address}</AppText>
          <AppText style={styles.cardSubtitle}>{item.phone}</AppText>
        </View>
        <TouchableOpacity style={styles.dotMenu} onPress={() => setSelectedMenu(item.id)}>
          <VectoreIcons
            icon="Entypo"
            name="dots-three-vertical"
            size={SW(13)}
            color={Colors.textHeader}
          />
          {selectedMenu === item.id && <ChatDropdownMenu menuOptions={addressMenuData} onClose={closeMenu} />}
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
    </View>
  );
  const closeMenu = () => setSelectedMenu(null);
  const { t } = useTranslation();
  return (
    <Container>
      <AppHeader
        headerTitle={t("selectAddress.title")}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        headerStyle={styles.header}
      />
      <Buttons
        isExtraBoxShadow={false}
        buttonStyle={styles.addAddressButton}
        textColor={Colors.textWhite}
        buttonTextStyle={styles.addAddressText}
        title={t('selectAddress.addNewAdd')}
        onPress={() => {
          navigate(RouteName.ADD_ADDRESS, { prevScreen: 'booking' })
        }}
      />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.buttonContainer}>
        <Buttons
          title={t("selectAddress.confirm")}
          onPress={() => {
            // navigation.navigate(RouteName.BOOK_APPOINT)
            prevType == 'forSelf' ? navigation.navigate(RouteName.PAYMENT_SCREEN) : goBack()
          }}
          buttonStyle={styles.addButton}
          textColor={Colors.textWhite}
        />
      </View>
      {selectedMenu && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}
    </Container>
  );
};

export default SelectAddress;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
    marginVertical: SW(15)
  },
  listContent: {
    paddingHorizontal: SW(25),
    paddingBottom: SH(100),
  },
  card: {
    marginBottom: SH(15),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    marginBottom: SH(4),
  },
  cardSubtitle: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textHeader,
  },

  dotMenu: {
    paddingLeft: SW(10),
    paddingTop: SH(5),
    zIndex: 10
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#3D3D3D30',
    marginTop: SH(10),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: SH(20),
    left: SW(25),
    right: SW(25),
  },
  addButton: {
    height: SH(48),
    borderRadius: SW(8),
    backgroundColor: Colors.themeColor,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    backgroundColor: ''
  },
  addAddressButton: {
    backgroundColor: Colors.themeColor,
    height: SF(28),
    width: SF(124),
    marginTop: 15,
    alignSelf: 'flex-end',
    marginRight: SW(25),
    borderRadius: 5,
    marginBottom: 25
  },
  addAddressText: {
    fontSize: SF(12),
  },
});
