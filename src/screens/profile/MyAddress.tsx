import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { useMemo } from 'react'
import { Container, AppHeader, CustomButton, CustomText } from '@components';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { useGetCustomerAddresses } from '@services/index';
// import { useQueryClient } from '@tanstack/react-query';
import AddressMenu from './AddressMenu';

export default function MyAddress() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation<any>();
  const navigation = useNavigation<any>();

  // Fetch addresses from API
  const { data: addressesData, isLoading, refetch } = useGetCustomerAddresses();
  const addresses = addressesData?.ResponseData || [];

  const handleAddNewAddress = () => {
    navigation.navigate('AddAddress', { prevScreen: 'my-address' });
  };


  const handleOptionsPress = (val: string, item: any) => {
    switch (val) {
      case 'edit':
        navigation.navigate('AddAddress', { mode: 'edit', addData: item });
        break;
      case 'delete':
        break;
    }
  }

  const formatAddress = (address: any) => {
    const parts = [address.line1];
    if (address.line2) parts.push(address.line2);
    if (address.landmark) parts.push(address.landmark);
    return parts.join(', ');
  };


  const renderAddressItem = ({ item }: { item: any }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressContent}>
        <CustomText style={styles.addressTitle} fontFamily={theme.fonts.BOLD}>
          {item.name}
        </CustomText>
        <CustomText style={styles.addressText}>{formatAddress(item)}</CustomText>
        <CustomText style={styles.addressPhone}>{item.contact}</CustomText>
        {item.isDefault && (
          <CustomText style={styles.defaultBadge}>Default</CustomText>
        )}
      </View>
      <Pressable
        style={styles.optionsButton}
      >
        <AddressMenu
          isBlocked={true}
          onSelect={(val) => {
            handleOptionsPress(val, item);
          }}
        />
      </Pressable>
    </View>
  );

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('myAddress.title')}
        onLeftPress={() => navigation.goBack()}
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
          title={t('myAddress.addNewAddress')}
          onPress={handleAddNewAddress}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          buttonStyle={styles.addButton}
        />
      </View>


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
    paddingTop: theme.SH(10),
    paddingBottom: theme.SH(100),
  },
  addressItem: {
    flexDirection: 'row',
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(16),
    backgroundColor: theme.colors.white,
    marginBottom: theme.SH(12),
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary || '#EAEAEA',
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
  addButton: {
    borderRadius: theme.borderRadius.md,
    height: theme.SF(50),
  },
});

