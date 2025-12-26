import { View, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator } from 'react-native';
import React, { useMemo, useState, } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomButton, CustomText, CustomInput } from '@components/common';
import { useTranslation } from 'react-i18next';

import imagePaths from '@assets';



interface CountryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: any) => void;
  selectedId?: string | null;
  type: 'country' | 'city';
  data: any[];
  isLoading: boolean
}

export default function CountryModal({
  visible,
  onClose,
  onSelect,
  selectedId,
  type,
  data = [],
  isLoading = false
}: CountryModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [searchCountry, setSearchCountry] = useState('');

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchCountry) return data;
    return data.filter((country: any) =>
      country.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
      country.countryCode?.toLowerCase().includes(searchCountry.toLowerCase())
    );
  }, [data, searchCountry]);

  // Set initial selected country if provided
  const handleCountrySelect = (country: any) => {
    onSelect(country);
    onClose();
  };



  const renderCountryItem = ({ item }: { item: any }) => {
    const isSelected = selectedId === item._id;
    return (
      <Pressable
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => handleCountrySelect(item)}
      >
        <View style={styles.itemContent}>
          {/* Flag placeholder - will be added in future */}
          {type === 'country' && <View style={styles.flagContainer}>
            {/* TODO: Add flag image here in future */}
            <CustomText fontSize={theme.fontSize.lg}>{item?.flag || ''}</CustomText>
          </View>}
          {type === 'city' && <CustomText style={[styles.countryName, isSelected ? styles.selectedCountryName : {}]}>
            {item.name}
          </CustomText>}
          {type === 'country' && <View style={styles.countryInfo}>
            <CustomText style={[styles.countryName, isSelected ? styles.selectedCountryName : {}]}>
              {item.name} {item?.countryCode && `(${item?.countryCode})`}
            </CustomText>
          </View>}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <CustomText style={styles.title}>
              {type === 'country' 
                ? t('signup.selectCountry') 
                : t('signup.selectCity')}
            </CustomText>

            <CustomInput
              placeholder={t('placeholders.search')}
              value={searchCountry}
              onChangeText={setSearchCountry}
              leftIcon={imagePaths.Search}
              marginTop={theme.SH(10)}
            />

            {isLoading ? (
              <View style={styles.listContainer}>
                <ActivityIndicator size="large" color={theme.colors.white} style={styles.loader} />
              </View>
            ) : (
              <FlatList
                data={filteredCountries}
                renderItem={renderCountryItem}
                keyExtractor={(item) => item._id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              />
            )}

            <View style={styles.buttonsContainer}>
              <CustomButton
                onPress={onClose}
                title={t('imagePickerModal.cancel')}
                buttonStyle={styles.confirmButton}
                buttonTextStyle={styles.confirmButtonText}
                backgroundColor={theme.colors.white}
                textColor={theme.colors.primary}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      height: '90%',
      position: 'absolute',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(20),
      paddingHorizontal: theme.SW(20),
      height: '100%',
      flexDirection: 'column',
    },
    title: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.text,
      fontFamily: theme.fonts.SEMI_BOLD,
      marginBottom: theme.SH(16),
      textAlign: 'center',
    },
    listContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      flex: 1,
      marginTop: theme.SH(10),
    },
    listContent: {
      flexGrow: 1,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.SH(12),
      paddingHorizontal: theme.SW(15),
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.SH(8),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedItem: {
      backgroundColor: theme.colors.secondary,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(12),
    },
    flagContainer: {
      width: theme.SW(32),
      height: theme.SH(24),
      justifyContent: 'center',
      alignItems: 'center',
    },
    flagPlaceholder: {
      width: theme.SW(28),
      height: theme.SH(20),
      backgroundColor: theme.colors.gray,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    countryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
    },
    countryName: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.MEDIUM,
      flex: 1,
    },
    selectedCountryName: {
      fontFamily: theme.fonts.SEMI_BOLD,
    },
    countryCode: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      fontFamily: theme.fonts.REGULAR,
      opacity: 0.8,
      paddingHorizontal: theme.SW(8),
      paddingVertical: theme.SH(4),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedCountryCode: {
      opacity: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    loader: {
      marginVertical: theme.SH(20),
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: theme.SW(12),
      marginTop: theme.SH(20),
    },
    confirmButton: {
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
    },
    confirmButtonText: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
    },
  });
