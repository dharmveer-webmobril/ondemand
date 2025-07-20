import React from 'react';
import { FlatList, Image,  StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, goBack,   getLanguageData, SF, SH, SW, StorageProvider } from '../../utils';
import i18next from 'i18next';
import RNRestart from 'react-native-restart';
import { useTranslation } from 'react-i18next';
import { AppHeader, AppText, Container } from '../../component';
import { useNavigation } from '@react-navigation/native';
type ChangeLanguageProps = {
    modalVisible: boolean;
    clodeModal: () => void;
    title: string;
    data: any
};
const ChangeLanguage: React.FC<ChangeLanguageProps> = () => {

    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const languageOptions = getLanguageData();

    const btnChangeLang = async (lan: string) => {
        console.log('i18next.language===', i18next.language);
        console.log('i18next.language===', lan);
        i18next.changeLanguage(lan)
        await StorageProvider.saveItem('language', lan)
        // i18next.changeLanguage(i18next.language === 'ar' ? 'en' : 'ar').then(() => {
        //   I18nManager.allowRTL(i18next.language === 'ar');
        //   I18nManager.forceRTL(i18next.language === 'ar');
        //   RNRestart.Restart()
        // })
    }
    return (
        <Container>
            <AppHeader
                headerTitle={t('profile.languageSettings')}
                onPress={() => {
                    goBack();
                }}
                Iconname="arrowleft"
                rightOnPress={() => { }}
                headerStyle={styles.header}
            />
            <View style={styles.container}>
                <FlatList
                    data={languageOptions}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: SH(20),
                    }}
                    renderItem={({ item }) => {
                        return (
                            <>
                                <TouchableOpacity onPress={() => {
                                    btnChangeLang(item.type)
                                }} style={styles.itemContainerDeactive}>
                                    <Image
                                        source={item.image}
                                        style={{ width: SW(35), height: SH(25) }}
                                    />
                                    <AppText allowFontScaling={false} style={styles.textCountryDeac}>{item.name}</AppText>
                                </TouchableOpacity>
                            </>
                        );
                    }}
                    keyExtractor={item => item.name}
                />
            </View>
        </Container>
    );
};

export default ChangeLanguage;

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.bgwhite,
        paddingHorizontal: SW(25),
    },
    container: {
        paddingHorizontal: SW(25),
        paddingTop: SH(40),
    },
    separator: {
        height: SH(1),
        backgroundColor: 'red',
    },
    itemContainerDeactive: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: SF(54),
        paddingHorizontal: SW(15),
        borderBottomWidth: 1,
        borderColor: `${Colors.textAppColor}50`,
    },
    textCountryDeac: {
        fontFamily: Fonts.REGULAR,
        fontSize: SF(16),
        marginLeft: SW(10),
    },
});
