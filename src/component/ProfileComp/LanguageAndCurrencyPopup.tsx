import React from 'react';
import { Alert, FlatList, I18nManager, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Container from '../Container';
import AppHeader from '../AppHeader';
import { Colors, Fonts, SF, SH, SW } from '../../utils';
import i18next from 'i18next';
import RNRestart from 'react-native-restart';
import Divider from '../Divider';
import AppText from '../AppText';
type LanguageAndCurrencyPopupProps = {
  modalVisible: boolean;
  clodeModal: () => void;
  title: string;
  data: any,
  type: string
};
const seperatorComponent = () => <Divider color={`${Colors.textAppColor}10`}/>;
const LanguageAndCurrencyPopup: React.FC<LanguageAndCurrencyPopupProps> = ({
  modalVisible = true,
  clodeModal,
  title = '',
  data,
  type
}) => {
  return (
    <Modal
      animationType="slide" // Can be "slide", "fade", or "none"
      transparent={true} // Makes the background semi-transparent
      visible={modalVisible}
      onRequestClose={() => clodeModal()} // Android back button handler
    >
      <Container isAuth>
        <AppHeader
          headerTitle={title}
          onPress={() => {
            clodeModal();
          }}
          Iconname="arrowleft"
          rightOnPress={() => { }}
          headerStyle={styles.header}
        />
        <View style={styles.container}>
          <FlatList
            data={data}
            showsVerticalScrollIndicator={false}
            bounces={false}
            ItemSeparatorComponent={seperatorComponent}
            contentContainerStyle={{
              paddingBottom: SH(20),
            }}
            renderItem={({ item }) => {
              return (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('i18next.language===', i18next.language === 'ar');
                      // i18next.changeLanguage(i18next.language === 'ar' ? 'en' : 'ar').then(() => {
                      //   I18nManager.allowRTL(i18next.language === 'ar');
                      //   I18nManager.forceRTL(i18next.language === 'ar');
                      // })
                    }}
                    style={styles.itemContainerDeactive}>
                    {type == 'language' ?
                      <>
                        <Image
                          source={item.image}
                          style={{ width: SW(35), height: SH(25) }}
                        />
                        <AppText style={styles.textCountryDeac}>{item.name}</AppText>
                      </>
                      :
                      <AppText style={styles.textCountryDeac}>{`${item.code} - ${item.name}`}</AppText>
                    }
                  </TouchableOpacity>
                </>
              );
            }}
            keyExtractor={(item,index) => item.name+index}
          />
        </View>
      </Container>
    </Modal>
  );
};

export default LanguageAndCurrencyPopup;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(40),
  },
  container: {
    paddingHorizontal: SW(25),
    paddingTop: SH(20),
    paddingBottom: SH(40),
  },
  separator: {
    height: SH(1),
    backgroundColor: 'red',
  },
  itemContainerDeactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: SF(60),
    paddingHorizontal: SW(15),
  },
  textCountryDeac: {
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
    fontSize: SF(16),
    marginLeft: SW(10),
  },
});
