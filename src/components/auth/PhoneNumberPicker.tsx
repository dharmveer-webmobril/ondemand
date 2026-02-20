import { View, StyleSheet, Modal, Pressable, FlatList,  } from 'react-native';
import { useMemo, useState, } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomButton, CustomText, CustomInput } from '@components/common';
import { useTranslation } from 'react-i18next';

import imagePaths from '@assets';



interface PhoneNumberPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: any) => void;
  data: any
  selectedContact: string | null
}

export default function PhoneNumberPicker({
  visible,
  onClose,
  onSelect,
  data,
  selectedContact
}: PhoneNumberPickerProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [searchCountry, setSearchCountry] = useState('');

  console.log('====data====', data);

  // Filter countries based on search
  const filteredContacts = useMemo(() => {
    if (!searchCountry) return data;
    return data.filter((contact: any) =>
      contact.displayName.toLowerCase().includes(searchCountry.toLowerCase()) ||
      contact.phoneNumber.toLowerCase().includes(searchCountry.toLowerCase())
    );
  }, [data, searchCountry]);

  // Set initial selected country if provided
  const handleCountrySelect = (country: any) => {
    onSelect(country);
    onClose();
  };



  const renderCountryItem = ({ item }: { item: any }) => {
    const isSelected = item._id === selectedContact;
    console.log('====item====', item);

    return (
      <Pressable
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => handleCountrySelect(item)}
      >
        <CustomText style={styles.countryName} numberOfLines={1}>{item?.displayName}</CustomText>
        <CustomText style={styles.phoneNumber}>{item?.phoneNumber}</CustomText>
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
              Select Contact
            </CustomText>

            <CustomInput
              placeholder={t('placeholders.search')}
              value={searchCountry}
              onChangeText={setSearchCountry}
              leftIcon={imagePaths.Search}
              marginTop={theme.SH(10)}
            />

            <FlatList
              data={filteredContacts || []}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item._id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            />


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
    countryName: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.MEDIUM,
      flex: 1,
    },
     
    phoneNumber: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      fontFamily: theme.fonts.MEDIUM,
      flex: 1,
      textAlign: 'right',
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
      color: theme.colors.white,
    },
  });
