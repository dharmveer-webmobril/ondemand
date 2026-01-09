import { View, StyleSheet, FlatList, Pressable } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Container, AppHeader, CustomButton, CustomText, VectoreIcons, ActionMenu, ActionMenuItem } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';

interface AddressItem {
  id: string;
  title: string;
  name: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}

export default function SelectAddress() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMenuAddressId, setSelectedMenuAddressId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // Mock data - replace with actual data from API/store
  const [addresses] = useState<AddressItem[]>([
    {
      id: '1',
      title: 'My Home',
      name: 'Sophie Nowakowska',
      address: 'Netherlands 12/2231-234 crowkon.poloe',
      phone: '+31 6387 7355',
      isDefault: true,
    },
    {
      id: '2',
      title: 'My Office',
      name: 'Sophie Nowakowska',
      address: 'Netherlands 12/2231-234 crowkon.poloe',
      phone: '+31 6387 7355',
    },
    {
      id: '3',
      title: 'Lorem Ipsum',
      name: 'Sophie Nowakowska',
      address: 'Netherlands 12/2231-234 crowkon.poloe',
      phone: '+31 6387 7355',
    },
  ]);

  const handleAddNewAddress = () => {
    navigation.navigate('AddAddress' as never, { mode: 'add' } as never);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleConfirm = () => {
    // Handle confirm logic here
    console.log('Selected address:', selectedAddressId);
    navigation.goBack();
  };

  const handleEditAddress = (addressId: string) => {
    navigation.navigate('AddAddress' as never, { mode: 'edit', addressId } as never);
    setShowMenu(false);
  };

  const handleDeleteAddress = (addressId: string) => {
    // Handle delete logic here
    console.log('Delete address:', addressId);
    setShowMenu(false);
  };

  const handleOptionsPress = (addressId: string, event: any) => {
    setSelectedMenuAddressId(addressId);
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setShowMenu(true);
  };

  const menuItems: ActionMenuItem[] = [
    {
      id: '1',
      label: t('myAddress.menuEdit'),
      icon: 'create-outline',
      onPress: () => selectedMenuAddressId && handleEditAddress(selectedMenuAddressId),
    },
    {
      id: '2',
      label: t('myAddress.menuDelete'),
      icon: 'trash-outline',
      color: theme.colors.red,
      onPress: () => selectedMenuAddressId && handleDeleteAddress(selectedMenuAddressId),
    },
  ];

  const renderAddressItem = ({ item }: { item: AddressItem }) => {
    const isSelected = selectedAddressId === item.id;
    
    return (
      <Pressable
        style={[styles.addressItem, isSelected && styles.addressItemSelected]}
        onPress={() => handleSelectAddress(item.id)}
      >
        <View style={styles.addressContent}>
          <CustomText style={styles.addressTitle} fontFamily={theme.fonts.BOLD}>
            {item.title}
          </CustomText>
          <CustomText style={styles.addressName}>{item.name}</CustomText>
          <CustomText style={styles.addressText}>{item.address}</CustomText>
          <CustomText style={styles.addressPhone}>{item.phone}</CustomText>
        </View>
        <Pressable
          style={styles.optionsButton}
          onPress={(e) => handleOptionsPress(item.id, e)}
        >
          <VectoreIcons
            name="ellipsis-vertical"
            size={theme.SF(20)}
            icon="Ionicons"
            color={theme.colors.lightText}
          />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('selectAddress.title')}
        onLeftPress={() => navigation.goBack()}
        rightIconName="add-outline"
        rightIconFamily="Ionicons"
        onRightPress={handleAddNewAddress}
      />
      
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddressItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>{t('myAddress.notFound')}</CustomText>
          </View>
        }
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          title={t('selectAddress.confirm')}
          onPress={handleConfirm}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          buttonStyle={styles.confirmButton}
        />
      </View>

      <ActionMenu
        visible={showMenu}
        items={menuItems}
        onClose={() => setShowMenu(false)}
        position={menuPosition}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F7F7F7',
  },
  listContent: {
    paddingTop: theme.SH(10),
    paddingBottom: theme.SH(100),
  },
  addressItem: {
    flexDirection: 'row',
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.SW(20),
    marginBottom: theme.SH(12),
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary || '#EAEAEA',
  },
  addressItemSelected: {
    backgroundColor: theme.colors.primary_light || '#E3F2FD',
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.SH(4),
  },
  addressName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
    marginBottom: theme.SH(2),
  },
  addressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.lightText,
    marginBottom: theme.SH(2),
  },
  addressPhone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.lightText,
    marginTop: theme.SH(4),
  },
  optionsButton: {
    padding: theme.SF(4),
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.SH(100),
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.lightText,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.SW(20),
    paddingBottom: Platform.OS === 'ios' ? theme.SH(20) : theme.SH(30),
    paddingTop: theme.SH(16),
    backgroundColor: theme.colors.background || '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary || '#EAEAEA',
  },
  confirmButton: {
    borderRadius: theme.borderRadius.md,
    height: theme.SF(50),
  },
});

