import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, goBack, SF, SH, SW, StorageProvider, LANGUAGE_OPTIONS_CONFIG } from '@utils';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, CustomText, VectoreIcons } from '@components';
import { useAppDispatch } from '@store/hooks';
import { setLanguage } from '@store/slices/appSlice';

const LanguageSettings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();

    const languageOptions = useMemo(
        () =>
            LANGUAGE_OPTIONS_CONFIG.map(item => ({
                ...item,
                name: t(item.labelKey),
            })),
        [t, i18n.language],
    );


    const btnChangeLang = async (lan: string) => {
        i18next.changeLanguage(lan);
        dispatch(setLanguage(lan));
        await StorageProvider.saveItem('language', lan);
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

