import { View, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native'
import { useMemo, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@store/hooks';
import HomeLocationPickerModal from './HomeLocationPickerModal';
import { HOME_HEADER_GRADIENT } from './homeHeaderConstants';

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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      <LinearGradient
        colors={[...HOME_HEADER_GRADIENT]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.gradientShell,
          {
            paddingTop: insets.top + theme.SH(10),
          },
        ]}
      >
        <View style={styles.row}>
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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onNotificationPress?.()}
            >
              <Image source={imagePaths.notification_icon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <HomeLocationPickerModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationApplied={onCityUpdate}
      />
    </>
  )
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  gradientShell: {
    width: '100%',
    overflow: 'hidden',
    paddingBottom: theme.SH(30),
    paddingHorizontal: theme.SW(16),
    borderBottomLeftRadius: theme.SF(30),
    borderBottomRightRadius: theme.SF(30),
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: theme.SW(6),
    maxWidth: '80%',
  },
  cityText: {
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