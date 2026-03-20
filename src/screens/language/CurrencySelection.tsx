import { FlatList, StyleSheet, Pressable, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Container, AppHeader } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StorageProvider } from '@utils/index';
import imagePaths from '@assets';

interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  flag: any;
}

export default function CurrencySelection() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const currencies: CurrencyItem[] = [
    { id: '1', code: 'IDR', name: 'Indonesian Rupiah', flag: imagePaths.US_flag }, // Placeholder
    { id: '2', code: 'USD', name: 'US Dollar', flag: imagePaths.US_flag },
    { id: '3', code: 'SGD', name: 'Singapore Dollar', flag: imagePaths.US_flag }, // Placeholder
    { id: '4', code: 'JPY', name: 'Japan Yen', flag: imagePaths.US_flag }, // Placeholder
    { id: '5', code: 'THB', name: 'Thailand Baht', flag: imagePaths.US_flag }, // Placeholder
    { id: '6', code: 'AUD', name: 'Australia Dollar', flag: imagePaths.US_flag }, // Placeholder
    { id: '7', code: 'CAD', name: 'Canadian Dollar', flag: imagePaths.US_flag }, // Placeholder
    { id: '8', code: 'GBP', name: 'British Pound', flag: imagePaths.US_flag }, // Placeholder
  ];

  const handleCurrencySelect = async (code: string) => {
    setSelectedCurrency(code);
    await StorageProvider.saveItem('currency', code);
  };

  const renderCurrencyItem = ({ item }: { item: CurrencyItem }) => {
    const isSelected = selectedCurrency === item.code;
    
    return (
      <Pressable
        style={styles.currencyItem}
        onPress={() => handleCurrencySelect(item.code)}
      >
        <View style={styles.leftContainer}>
          <View style={styles.checkboxContainer}>
            {isSelected ? (
              <View style={styles.checkboxSelected}>
                <VectoreIcons
                  name="checkmark"
                  size={theme.SF(16)}
                  icon="Ionicons"
                  color={theme.colors.white}
                />
              </View>
            ) : (
              <View style={styles.checkboxUnselected} />
            )}
          </View>
          <View style={styles.flagContainer}>
            <ImageLoader
              source={item.flag}
              mainImageStyle={styles.flag}
              resizeMode="contain"
            />
          </View>
          <View style={styles.currencyInfo}>
            <CustomText style={styles.currencyCode}>{item.code}</CustomText>
            <CustomText style={styles.currencyName}>{item.name}</CustomText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('languageSetting.chooseCurrency')}
        onLeftPress={() => navigation.goBack()}
      />
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.id}
        renderItem={renderCurrencyItem}
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    marginBottom: theme.SH(12),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: theme.SW(15),
  },
  checkboxUnselected: {
    width: theme.SF(24),
    height: theme.SF(24),
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.secondary || '#EAEAEA',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    width: theme.SF(24),
    height: theme.SF(24),
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.SEMI_BOLD,
    marginBottom: theme.SH(4),
  },
  currencyName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.REGULAR,
  },
});

