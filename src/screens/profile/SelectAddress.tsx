import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { Container, AppHeader, CustomButton, CustomText } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Platform } from 'react-native';
import { useGetCustomerAddresses } from '@services/index';
import { useAppSelector } from '@store/hooks';

export default function SelectAddress() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Fetch addresses from API
  const { data: addressesData, isLoading, refetch } = useGetCustomerAddresses();
  const addresses = addressesData?.ResponseData || [];
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];

  // Set default selected address
  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress, selectedAddressId]);

  const formatAddress = (address: any) => {
    const parts = [address.line1];
    if (address.line2) parts.push(address.line2);
    if (address.landmark) parts.push(address.landmark);
    return parts.join(', ');
  };
  const userCityName = useAppSelector((state) => state.app.userCity)?.name;
  console.log('userCityName', userCityName);
  console.log('addresses', addresses);
  const handleAddNewAddress = () => {
    navigation.navigate('AddAddress' as never, { addData: null, prevScreen: 'select-address' } as never);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleConfirm = () => {
    const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId);
    if (selectedAddress) {
      // Pass selected address back via route params callback or navigation
      const onSelect = route.params?.onSelect;
      if (onSelect) {
        onSelect(selectedAddress);
      }
      navigation.goBack();
    }
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const isSelected = selectedAddressId === item._id;
    
    return (
      <Pressable
        style={[styles.addressItem, isSelected && styles.addressItemSelected, item.city?.name?.toLowerCase()?.trim() !== userCityName?.toLowerCase()?.trim() && styles.addressItemDisabled]}
        onPress={() => handleSelectAddress(item._id)}
        disabled={item.city?.name?.toLowerCase()?.trim() !== userCityName?.toLowerCase()?.trim()}
      >
        <View style={styles.addressContent}>
          <View style={styles.radioButtonContainer}>
            <View
              style={[
                styles.radioButton,
                isSelected && styles.radioButtonSelected,
              ]}
            >
              {isSelected && <View style={styles.radioButtonInner} />}
            </View>
          </View>
          <View style={styles.addressInfo}>
            <CustomText style={styles.addressTitle} fontFamily={theme.fonts.BOLD}>
              {item?.name}
            </CustomText>
            <CustomText style={styles.addressText}>{formatAddress(item)}</CustomText>
            <CustomText style={styles.addressPhone}>{item?.contact}</CustomText>
            {item?.isDefault && (
              <CustomText style={styles.defaultBadge}>Default</CustomText>
            )}
          </View>
        </View>
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
        containerStyle={{ marginHorizontal: theme.SW(20) }}
      />
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderAddressItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>{t('myAddress.notFound')}</CustomText>
            </View>
          }
        />
      )}

      <View style={styles.buttonContainer}>
        <CustomButton
          title={t('selectAddress.confirm')}
          onPress={handleConfirm}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          buttonStyle={styles.confirmButton}
          disable={!selectedAddressId || addresses.length === 0}
        />
      </View>
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
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  addressContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButtonContainer: {
    paddingTop: theme.SH(2),
    marginRight: theme.SW(12),
  },
  radioButton: {
    width: theme.SF(20),
    height: theme.SF(20),
    borderRadius: theme.SF(10),
    borderWidth: 2,
    borderColor: theme.colors.gray || '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: theme.SF(10),
    height: theme.SF(10),
    borderRadius: theme.SF(5),
    backgroundColor: theme.colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.SH(100),
  },
  defaultBadge: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontFamily: theme.fonts.MEDIUM,
    marginTop: theme.SH(4),
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
  addressItemDisabled: {
    opacity: 0.5,
  },
});

