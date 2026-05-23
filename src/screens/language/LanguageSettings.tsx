import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, goBack, SF, SH, SW, StorageProvider, LANGUAGE_OPTIONS_CONFIG } from '@utils';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, Container, CustomText, VectoreIcons } from '@components';
type LanguageSettingsProps = {
    modalVisible: boolean;
    clodeModal: () => void;
    title: string;
    data: any
};
const LanguageSettings: React.FC<LanguageSettingsProps> = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();

    const languageOptions = useMemo(
        () =>
            LANGUAGE_OPTIONS_CONFIG.map(item => ({
                ...item,
                name: t(item.labelKey),
            })),
        [t, i18n.language],
    );


    const btnChangeLang = async (lan: string) => {
        console.log('i18next.language===', i18next.language);
        console.log('i18next.language===', lan);
        i18next.changeLanguage(lan)
        await StorageProvider.saveItem('language', lan)
        // i18next.LanguageSettings(i18next.language === 'ar' ? 'en' : 'ar').then(() => {
        //   I18nManager.allowRTL(i18next.language === 'ar');
        //   I18nManager.forceRTL(i18next.language === 'ar');
        //   RNRestart.Restart()
        // })
    }

    return (
        <Container safeArea={true}>
           <AppHeader
                title={t('profile.languageSettings')}
                  onLeftPress={() => {
                      goBack();
                  }}
                leftIconName="angle-left"
                leftIconFamily="FontAwesome"
                containerStyle={styles.header}
            />  
            <View style={styles.container}>
                <FlatList
                    data={languageOptions}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: SH(20),
                    }}
                    renderItem={({ item }) => {
                        const isSelected = i18n.language === item.type;
                        return (
                            <TouchableOpacity
                                onPress={() => btnChangeLang(item.type)}
                                style={[
                                    styles.itemContainerDeactive,
                                    isSelected && styles.itemContainerActive,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={item.image}
                                    style={styles.flagImage}
                                    resizeMode="cover"
                                />
                                <CustomText
                                    style={[
                                        styles.textCountryDeac,
                                        isSelected && styles.textCountryActive,
                                    ]}
                                >
                                    {item.name}
                                </CustomText>
                                {isSelected ? (
                                    <VectoreIcons
                                        name="checkmark-circle"
                                        icon="Ionicons"
                                        size={SF(22)}
                                        color={Colors.primary}
                                        style={styles.checkIcon}
                                    />
                                ) : null}
                            </TouchableOpacity>
                        );
                    }}
                    keyExtractor={item => item.type}
                />
            </View>
        </Container>
    );
};

export default LanguageSettings;

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.white,
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
    itemContainerActive: {
        backgroundColor: `${Colors.primary}12`,
    },
    flagImage: {
        width: SW(35),
        height: SH(25),
        borderRadius: SF(4),
        overflow: 'hidden',
    },
    textCountryDeac: {
        flex: 1,
        fontFamily: Fonts.REGULAR,
        fontSize: SF(16),
        marginLeft: SW(10),
    },
    textCountryActive: {
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.primary,
    },
    checkIcon: {
        marginLeft: SW(8),
    },
});



// import { View, StyleSheet, Pressable } from 'react-native'
// import React, { useMemo } from 'react'
// import { Container, AppHeader } from '@components';
// import { ThemeType, useThemeContext } from '@utils/theme';
// import { CustomText, VectoreIcons } from '@components/common';
// import { useTranslation } from 'react-i18next';
// import { useNavigation } from '@react-navigation/native';

// export default function LanguageSettings() {
//   const theme = useThemeContext();
//   const styles = useMemo(() => createStyles(theme), [theme]);
//   const { t } = useTranslation();
//   const navigation = useNavigation();

//   const handleLanguagePress = () => {
//     navigation.navigate('LanguageSelection' as never);
//   };

//   const handleCurrencyPress = () => {
//     navigation.navigate('CurrencySelection' as never);
//   };

//   return (
//     <Container safeArea={true} style={styles.container}>
//       <AppHeader
//         title={t('languageSetting.languageSettings')}
//         onLeftPress={() => navigation.goBack()}
//       />
//       <View style={styles.content}>
//         <View style={styles.section}>
//           <CustomText style={styles.sectionTitle}>
//             {t('languageSetting.supportSection')}
//           </CustomText>
//           <Pressable style={styles.menuItem} onPress={handleLanguagePress}>
//             <CustomText style={styles.menuItemText}>
//               {t('languageSetting.language')}
//             </CustomText>
//             <VectoreIcons
//               name="chevron-forward"
//               size={theme.SF(20)}
//               icon="Ionicons"
//               color={theme.colors.lightText}
//             />
//           </Pressable>
//         </View>

//         <View style={styles.section}>
//           <CustomText style={styles.sectionTitle}>
//             {t('languageSetting.currencyConverter')}
//           </CustomText>
//           <Pressable style={styles.menuItem} onPress={handleCurrencyPress}>
//             <CustomText style={styles.menuItemText}>
//               {t('languageSetting.currencySwitcher')}
//             </CustomText>
//             <VectoreIcons
//               name="chevron-forward"
//               size={theme.SF(20)}
//               icon="Ionicons"
//               color={theme.colors.lightText}
//             />
//           </Pressable>
//         </View>
//       </View>
//     </Container>
//   );
// }

// const createStyles = (theme: ThemeType) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background || '#F7F7F7',
//     paddingHorizontal: theme.SW(20),
//   },
//   content: {
//     paddingTop: theme.SH(20),
//   },
//   section: {
//     marginBottom: theme.SH(30),
//   },
//   sectionTitle: {
//     fontSize: theme.fontSize.sm,
//     color: theme.colors.lightText,
//     fontFamily: theme.fonts.MEDIUM,
//     marginBottom: theme.SH(12),
//     paddingHorizontal: theme.SW(4),
//   },
//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: theme.colors.secondary || '#EEF6F9',
//     borderRadius: theme.borderRadius.md,
//     paddingHorizontal: theme.SW(20),
//     paddingVertical: theme.SH(16),
//   },
//   menuItemText: {
//     fontSize: theme.fontSize.md,
//     color: theme.colors.text,
//     fontFamily: theme.fonts.MEDIUM,
//   },
// });

