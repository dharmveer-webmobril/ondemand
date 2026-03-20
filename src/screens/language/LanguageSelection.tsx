import { FlatList, StyleSheet, Pressable, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Container, AppHeader } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader } from '@components/common';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StorageProvider } from '@utils/index';
import imagePaths from '@assets';

interface LanguageItem {
  id: string;
  code: string;
  name: string;
  flag: any;
}

export default function LanguageSelection() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  const languages: LanguageItem[] = [
    { id: '1', code: 'en', name: 'United State', flag: imagePaths.US_flag },
    { id: '2', code: 'ar', name: 'Arabic', flag: imagePaths.US_flag }, // Placeholder
    { id: '3', code: 'sq', name: 'Albanian', flag: imagePaths.US_flag }, // Placeholder
    { id: '4', code: 'nl', name: 'Dutch', flag: imagePaths.US_flag }, // Placeholder
    { id: '5', code: 'fr', name: 'French', flag: imagePaths.france },
    { id: '6', code: 'de', name: 'German', flag: imagePaths.US_flag }, // Placeholder
    { id: '7', code: 'hi', name: 'India', flag: imagePaths.india },
    { id: '8', code: 'id', name: 'Indonesian', flag: imagePaths.US_flag }, // Placeholder
    { id: '9', code: 'nz', name: 'New Zealand', flag: imagePaths.US_flag }, // Placeholder
    { id: '10', code: 'es', name: 'Spanish', flag: imagePaths.spain },
    { id: '11', code: 'tr', name: 'Turkish', flag: imagePaths.US_flag }, // Placeholder
    { id: '12', code: 'vi', name: 'Vietnam', flag: imagePaths.US_flag }, // Placeholder
    { id: '13', code: 'pt', name: 'Portuguese', flag: imagePaths.portugal },
  ];

  const handleLanguageSelect = async (code: string) => {
    console.log('code', code);
    
    setSelectedLanguage(code);
    // i18n.changeLanguage(code);
    // await StorageProvider.setItem('language', code);
  };

  const renderLanguageItem = ({ item }: { item: LanguageItem }) => {
    const isSelected = selectedLanguage === item.code;
    
    return (
      <Pressable
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem
        ]}
        onPress={() => handleLanguageSelect(item.code)}
      >
        <View style={styles.flagContainer}>
          <ImageLoader
            source={item.flag}
            mainImageStyle={styles.flag}
            resizeMode="contain"
          />
        </View>
        <CustomText
          style={[
            styles.languageName,
            // isSelected && styles.selectedLanguageName
          ]}
        >
          {item.name}
        </CustomText>
      </Pressable>
    );
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('languageSetting.languageSettings')}
        onLeftPress={() => navigation.goBack()}
      />
      <FlatList
        data={languages}
        keyExtractor={(item) => item.id}
        renderItem={renderLanguageItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F7F7F7',
    paddingHorizontal: theme.SW(20),
  },
  listContent: {
    paddingTop: theme.SH(20),
    paddingBottom: theme.SH(20),
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    marginBottom: theme.SH(12),
  },
  selectedLanguageItem: {
    backgroundColor: theme.colors.primary,
  },
  flagContainer: {
    width: theme.SF(30),
    height: theme.SF(30),
    marginRight: theme.SW(15),
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  languageName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
    flex: 1,
  },
  selectedLanguageName: {
    color: theme.colors.white,
  },
});

