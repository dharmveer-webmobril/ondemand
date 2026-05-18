import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  CustomText,
  CustomButton,
  VectoreIcons,
  showToast,
} from '@components/common';
import { useGetCustomerAddresses } from '@services/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setCurrentLocationAddress } from '@store/slices/appSlice';
import { mapApiAddressToCustomerLocation } from '@utils/address/customerLocation';
import { tryResolveLocationFromDevice } from '@utils/address/deviceLocation';
import { queryClient } from '@services/api';
import SCREEN_NAMES from '@navigation/ScreenNames';
import type { Address } from '@services/api/queries/appQueries';
import { formatAddress } from '@utils/tools';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeLocationPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onLocationApplied?: () => void;
};

function formatSavedAddressLine(item: Address): string {
  const row = item as Address & {
    city?: { name?: string } | string;
    country?: { name?: string } | string;
  };
  const cityName =
    typeof row.city === 'object' && row.city?.name != null
      ? String(row.city.name)
      : String(row.city ?? '');
  const countryName =
    typeof row.country === 'object' && row.country?.name != null
      ? String(row.country.name)
      : String(row.country ?? '');
  return formatAddress({
    line1: row.line1,
    line2: row.line2 ?? '',
    landmark: row.landmark ?? '',
    pincode: row.pincode,
    city: cityName,
    country: countryName,
  });
}

export default function HomeLocationPickerModal({
  visible,
  onClose,
  onLocationApplied,
}: HomeLocationPickerModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [refreshingDevice, setRefreshingDevice] = useState(false);

  const currentLocationAddress = useAppSelector(
    state => state.app.currentLocationAddress,
  );

  const {
    data: addressesData,
    isLoading,
    refetch,
  } = useGetCustomerAddresses({ enabled: visible });

  const addresses = addressesData?.ResponseData ?? [];

  useEffect(() => {
    if (visible) {
      refetch().catch(() => {});
    }
  }, [visible, refetch]);

  const invalidateHomeQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
    queryClient.invalidateQueries({ queryKey: ['serviceProviders'] });
    queryClient.invalidateQueries({ queryKey: ['topRatedTopOfferedServices'] });
    onLocationApplied?.();
  }, [onLocationApplied]);

  const handleSelectSaved = useCallback(
    (item: Address) => {
      const mapped = mapApiAddressToCustomerLocation(item);
      if (!mapped) {
        showToast({
          type: 'error',
          title: t('common.error'),
          message: t('home.addressApplyError'),
        });
        return;
      }
      dispatch(setCurrentLocationAddress(mapped));
      invalidateHomeQueries();
      onClose();
    },
    [dispatch, invalidateHomeQueries, onClose, t],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    setRefreshingDevice(true);
    try {
      const fromDevice = await tryResolveLocationFromDevice();
      if (fromDevice) {
        dispatch(setCurrentLocationAddress(fromDevice));
        invalidateHomeQueries();
        onClose();
      } else {
        showToast({
          type: 'info',
          title: t('home.locationToastTitle'),
          message: t('home.locationUnavailable'),
        });
      }
    } finally {
      setRefreshingDevice(false);
    }
  }, [dispatch, invalidateHomeQueries, onClose, t]);

  const handleAddNewAddress = useCallback(() => {
    onClose();
    navigation.navigate(SCREEN_NAMES.ADD_ADDRESS, { prevScreen: 'home' });
  }, [navigation, onClose]);

  const deviceSubtitle =
    currentLocationAddress?.formattedAddress?.trim() ||
    currentLocationAddress?.line1?.trim() ||
    currentLocationAddress?.cityName?.trim() ||
    t('home.tapToDetect');

  const isDeviceSource = !currentLocationAddress?._id;
  const selectedSavedId = currentLocationAddress?._id;

  const renderSavedItem = useCallback(
    ({ item }: { item: Address }) => {
      const isSelected = selectedSavedId === item._id;
      return (
        <Pressable
          style={({ pressed }) => [
            styles.addressItem,
            isSelected && styles.selectedAddressItem,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => handleSelectSaved(item)}
        >
          <View style={styles.savedRow}>
            <View
              style={[
                styles.radioOuter,
                isSelected && styles.radioOuterSelected,
              ]}
            >
              {isSelected ? <View style={styles.radioInner} /> : null}
            </View>
            <View style={styles.savedTextWrap}>
              <CustomText
                style={[
                  styles.savedTitle,
                  isSelected && styles.savedTitleSelected,
                ]}
                fontFamily={theme.fonts.SEMI_BOLD}
              >
                {item.name}
              </CustomText>
              <CustomText style={styles.savedBody} numberOfLines={3}>
                {formatSavedAddressLine(item)}
              </CustomText>
              {item.contact ? (
                <CustomText style={styles.savedPhone}>
                  {item.contact}
                </CustomText>
              ) : null}
            </View>
          </View>
        </Pressable>
      );
    },
    [handleSelectSaved, selectedSavedId, styles, theme.fonts],
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.headerRow}>
              <CustomText style={styles.title}>
                {t('home.chooseLocation')}
              </CustomText>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeHit}>
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.deviceCard,
                isDeviceSource && styles.deviceCardSelected,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleUseCurrentLocation}
              disabled={refreshingDevice}
            >
              <View style={styles.deviceRow}>
                {refreshingDevice ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                ) : (
                  <VectoreIcons
                    name="navigate"
                    icon="Ionicons"
                    size={theme.SF(22)}
                    color={
                      isDeviceSource ? theme.colors.primary : theme.colors.text
                    }
                  />
                )}
                <View style={styles.deviceTextWrap}>
                  <CustomText
                    style={[
                      styles.deviceTitle,
                      isDeviceSource && styles.deviceTitleSelected,
                    ]}
                    fontFamily={theme.fonts.SEMI_BOLD}
                  >
                    {t('home.useCurrentLocation')}
                  </CustomText>
                  <CustomText style={styles.deviceSub} numberOfLines={2}>
                    {deviceSubtitle}
                  </CustomText>
                </View>
                {isDeviceSource ? (
                  <View style={styles.tag}>
                    <CustomText style={styles.tagText}>
                      {t('home.locationActive')}
                    </CustomText>
                  </View>
                ) : null}
              </View>
            </Pressable>

            <CustomButton
              title={t('home.addNewAddress')}
              onPress={handleAddNewAddress}
              buttonStyle={styles.addBtn}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.whitetext}
            />

            <CustomText style={styles.sectionLabel}>
              {t('home.savedAddresses')}
            </CustomText>

            {isLoading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <CustomText style={styles.loaderHint}>
                  {t('home.loadingAddresses')}
                </CustomText>
              </View>
            ) : addresses.length === 0 ? (
              <View style={styles.emptyWrap}>
                <CustomText style={styles.emptyText}>
                  {t('home.noSavedAddressesYet')}
                </CustomText>
              </View>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={item => item._id}
                renderItem={renderSavedItem}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              />
            )}
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors, SF, fonts, SW, SH } = theme;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.white,
      borderTopLeftRadius: SF(20),
      borderTopRightRadius: SF(20),
      paddingHorizontal: SW(20),
      paddingTop: SH(16),
      paddingBottom: SH(28),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SH(16),
    },
    title: {
      fontSize: SF(18),
      fontFamily: fonts.SEMI_BOLD,
      color: colors.text,
      textAlign: 'center',
    },
    closeHit: {
      position: 'absolute',
      right: 0,
      top: 0,
      padding: SW(4),
    },
    deviceCard: {
      borderWidth: 1,
      borderColor: colors.gray || '#E0E0E0',
      borderRadius: SF(12),
      padding: SW(14),
      marginBottom: SH(12),
      backgroundColor: colors.background || '#F8F9FA',
    },
    deviceCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary || '#E3F2FD',
    },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(12),
    },
    deviceTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    deviceTitle: {
      fontSize: SF(16),
      color: colors.text,
      marginBottom: SH(4),
    },
    deviceTitleSelected: {
      color: colors.primary,
    },
    deviceSub: {
      fontSize: SF(13),
      color: colors.lightText || colors.textAppColor,
    },
    tag: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      paddingHorizontal: SW(8),
      paddingVertical: SH(4),
      borderRadius: SF(6),
    },
    tagText: {
      fontSize: SF(11),
      fontFamily: fonts.MEDIUM,
      color: colors.whitetext,
    },
    addBtn: {
      borderRadius: SF(12),
      marginBottom: SH(16),
    },
    sectionLabel: {
      fontSize: SF(14),
      fontFamily: fonts.SEMI_BOLD,
      color: colors.text,
      marginBottom: SH(8),
    },
    list: {
      maxHeight: SH(280),
    },
    listContent: {
      paddingBottom: SH(8),
      gap: SH(10),
    },
    addressItem: {
      borderWidth: 1,
      borderColor: colors.gray || '#E0E0E0',
      borderRadius: SF(12),
      padding: SW(14),
      backgroundColor: colors.white,
    },
    selectedAddressItem: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary || '#E3F2FD',
    },
    savedRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(12),
    },
    radioOuter: {
      width: SF(20),
      height: SF(20),
      borderRadius: SF(10),
      borderWidth: 2,
      borderColor: colors.gray || '#999',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SH(2),
    },
    radioOuterSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: SF(10),
      height: SF(10),
      borderRadius: SF(5),
      backgroundColor: colors.primary,
    },
    savedTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    savedTitle: {
      fontSize: SF(15),
      color: colors.text,
      marginBottom: SH(4),
    },
    savedTitleSelected: {
      color: colors.primary,
    },
    savedBody: {
      fontSize: SF(13),
      color: colors.textAppColor || colors.text,
    },
    savedPhone: {
      fontSize: SF(12),
      color: colors.lightText,
      marginTop: SH(4),
    },
    loaderWrap: {
      paddingVertical: SH(24),
      alignItems: 'center',
      gap: SH(10),
    },
    loaderHint: {
      fontSize: SF(13),
      fontFamily: fonts.REGULAR,
      color: colors.lightText,
    },
    emptyWrap: {
      paddingVertical: SH(16),
    },
    emptyText: {
      fontSize: SF(14),
      color: colors.lightText,
      textAlign: 'center',
    },
  });
};
