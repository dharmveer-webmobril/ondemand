import { View, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native'
import { useMemo, useState } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@store/hooks';
import HomeLocationPickerModal from './HomeLocationPickerModal';

type HomeHeaderProps = {
  onCityUpdate?: () => void;
  onCityUpdateLoading?: (isLoading: boolean) => void;
  onNotificationPress?: () => void;
};

export default function HomeHeader({
  onCityUpdate,
  onCityUpdateLoading: _onCityUpdateLoading,
  onNotificationPress,
}: HomeHeaderProps) {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // const insets = useSafeAreaInsets();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const currentLocationAddress = useAppSelector(
    state => state.app.currentLocationAddress,
  );
  const userCity = useAppSelector(state => state.app.userCity);

  const currentCity = useMemo(() => {
    const fromAddr = currentLocationAddress?.cityName?.trim() || '';
    if (fromAddr) return fromAddr;
    const uc = userCity;
    const fromProfile =
      typeof uc === 'object' && uc?.name != null
        ? String(uc.name).trim()
        : typeof uc === 'string'
          ? uc.trim()
          : '';
    return fromProfile || t('home.selectCity');
  }, [currentLocationAddress?.cityName, userCity, t]);

  const addressLine = useMemo(() => {
    const a = currentLocationAddress;
    const fromAddr =
      a?.formattedAddress?.trim() ||
      a?.line1?.trim() ||
      a?.cityName?.trim() ||
      '';
    if (fromAddr) return fromAddr;
    return currentCity;
  }, [currentLocationAddress, currentCity]);


  const openLocationPicker = () => setShowLocationModal(true);

  return (
    <>
      {/* <LinearGradient
        colors={['#011321', '#066AB7', '#009BFF']}
        style={[
          styles.headerContainer,
          { paddingTop: insets.top }
        ]}
      > */}
        <View style={styles.container}>
          <Pressable
            style={styles.leftContainer}
            onPress={openLocationPicker}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <View style={styles.locationIconWrap}>
              <VectoreIcons
                name="location-sharp"
                size={24}
                icon="Ionicons"
                color={'white'}
              />
            </View>
            <View style={styles.locationContainer}>
              <CustomText style={styles.currentLocationText}>
                {t('home.headerCurrentLocation')}
              </CustomText>
              <View style={styles.locationRow}>
                <CustomText numberOfLines={2} style={styles.cityText}>
                  {addressLine}
                </CustomText>
                <Image source={imagePaths.down} style={styles.downChevron} />
              </View>
            </View>
          </Pressable>
          <View style={styles.rightView}>
            {/* <TouchableOpacity
              style={styles.iconButton}
              onPress={() => { }}
            >
              <Image source={imagePaths.calender_icon} style={styles.icon} />
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onNotificationPress?.()}
            >
              <Image source={imagePaths.notification_icon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      {/* </LinearGradient> */}

      <HomeLocationPickerModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationApplied={onCityUpdate}
      />
    </>
  )
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: theme.SH(30),
    paddingTop: theme.SH(10),
    backgroundColor: '#009BFF',
    paddingHorizontal: theme.SW(16),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  locationContainer: {
    marginLeft: theme.SW(6),
    flex: 1,
    minWidth: 0,
  },
  locationTitle: {
    color: theme.colors.whitetext,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.MEDIUM
  },
  locationValue: {
    marginTop: 2,
    color: theme.colors.whitetext,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.SEMI_BOLD
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: theme.SW(8),
  },
  locationIconWrap: {
    flexShrink: 0,
    justifyContent: 'center',
  },
  currentLocationText: {
    fontSize: theme.SF(12),
    color: theme.colors.whitetext,
    fontFamily: theme.fonts.SEMI_BOLD,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    minWidth: 0,
    gap: theme.SW(6),
  },
  cityText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: theme.SF(14),
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.BOLD,
  },
  downChevron: {
    height: theme.SH(12),
    width: theme.SH(12),
    marginTop: theme.SH(2),
    resizeMode: 'contain',
    flexShrink: 0,
  },
  rightView: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    paddingHorizontal: theme.SW(5),
  },
  icon: {
    height: theme.SF(27),
    width: theme.SF(27),
    resizeMode: 'contain',
  },
})