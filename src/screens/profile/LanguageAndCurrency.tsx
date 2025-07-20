import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  AppHeader,
  AppText,
  Container,
  LanguageAndCurrencyPopup,
  ProfileList,
  Spacing,
} from '../../component';
import {Colors, Fonts, SF, SH, SW} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import RouteName from '../../navigation/RouteName';

type LanguageAndCurrencyProps = {};
const LanguageAndCurrency: React.FC<LanguageAndCurrencyProps> = ({}) => {

  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
 
  const [title, setTitle] = useState<any>(t('profile.languageSettings'));

  let languageJson = {
    name: t('languageSetting.language'),
    id: 10,
    onClick: () => {
      navigation.navigate(RouteName.CHANGE_LANGUGAE)
    },
  };

   

  return (
    <Container isPadding={true}>
      <AppHeader
        headerTitle={t('profile.languageSettings')}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.pop();
          }
        }}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={styles.header}
      />
      <View style={styles.container}>
        <AppText style={styles.sectionTitle}>
          {t('languageSetting.supportSection')}
        </AppText>
        <ProfileList item={languageJson} />
        {/* <Spacing space={SH(20)} />
        <AppText style={styles.sectionTitle}>
          {t('languageSetting.currencyConverter')}
        </AppText>
        <ProfileList item={currencyJson} /> */}
      </View>
    </Container>
  );
};

export default LanguageAndCurrency;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
  },
  container: {
    paddingHorizontal: SW(25),
    paddingTop: SH(40),
  },
  sectionTitle: {
    color: Colors.textAppColor,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(16),
    marginBottom: SH(25),
    marginTop: SH(5),
  },
});
