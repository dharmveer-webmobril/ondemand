import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';

const DEFAULT_MAP_DELTA = 0.012;
const MIN_MAP_DELTA = 0.0008;
const MAX_MAP_DELTA = 0.45;

const regionForCoords = (
  lat: number,
  lng: number,
  delta: number = DEFAULT_MAP_DELTA,
): Region => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta: delta,
  longitudeDelta: delta,
});

type ProviderDetailsProps = {
  aboutUs?: string;
  phoneNumber?: string;
  onCall?: () => void;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  amenities?: string[];
  onServiceFeePress?: () => void;
  onPaymentPolicyPress?: () => void;
  onReportPress?: () => void;
  refreshControl?: React.ReactElement<RefreshControl>;
  /** Rendered below the About Us section (e.g. members list) */
  membersSection?: React.ReactNode;
  /** Business location — map is shown when both are finite numbers */
  latitude?: number | null;
  longitude?: number | null;
};

export default function ProviderDetails({
  aboutUs = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  phoneNumber,
  onCall,
  facebookUrl,
  instagramUrl,
  websiteUrl,
  amenities = [],
  onServiceFeePress: _onServiceFeePress,
  onPaymentPolicyPress,
  onReportPress,
  refreshControl,
  membersSection,
  latitude,
  longitude,
}: ProviderDetailsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const fullMapRef = useRef<MapView>(null);
  const [fullMapVisible, setFullMapVisible] = useState(false);
  const [mapZoomDelta, setMapZoomDelta] = useState(DEFAULT_MAP_DELTA);

  const lat = latitude != null ? Number(latitude) : NaN;
  const lng = longitude != null ? Number(longitude) : NaN;
  const hasMapCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const openFullMap = useCallback(() => {
    setMapZoomDelta(DEFAULT_MAP_DELTA);
    setFullMapVisible(true);
  }, []);

  const closeFullMap = useCallback(() => {
    setFullMapVisible(false);
  }, []);

  const adjustMapZoom = useCallback(
    (zoomIn: boolean) => {
      if (!hasMapCoords) return;
      setMapZoomDelta(prev => {
        const factor = zoomIn ? 0.5 : 2;
        const next = Math.max(
          MIN_MAP_DELTA,
          Math.min(MAX_MAP_DELTA, prev * factor),
        );
        fullMapRef.current?.animateToRegion(regionForCoords(lat, lng, next), 200);
        return next;
      });
    },
    [hasMapCoords, lat, lng],
  );

  const openInMaps = () => {
    if (!hasMapCoords) return;
    const q = `${lat},${lng}`;
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${q}`
        : `geo:0,0?q=${q}(${encodeURIComponent('Business')})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      );
    });
  };

  const openExternalUrl = (rawUrl?: string) => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) return;
    const url =
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      // @ts-ignore
      refreshControl={refreshControl}
    >
      {hasMapCoords ? (
        <View style={styles.mapWrapper}>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={regionForCoords(lat, lng)}
            scrollEnabled={false}
            zoomEnabled={false}
            zoomTapEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          >
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              tracksViewChanges={false}
            />
          </MapView>
          <Pressable
            onPress={openFullMap}
            style={({ pressed }) => [
              styles.mapExpandButton,
              pressed && styles.mapExpandButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('providerDetails.expandMap')}
          >
            <VectoreIcons
              name="expand-outline"
              icon="Ionicons"
              size={theme.SF(20)}
              color={theme.colors.text}
            />
          </Pressable>
          <Pressable
            onPress={openInMaps}
            style={({ pressed }) => [
              styles.mapOpenRow,
              pressed && styles.mapOpenRowPressed,
            ]}
          >
            <VectoreIcons
              name="map-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.primary}
            />
            <CustomText style={styles.mapOpenText}>
              {t('providerDetails.openInMaps')}
            </CustomText>
            <VectoreIcons
              name="open-outline"
              icon="Ionicons"
              size={theme.SF(16)}
              color={theme.colors.lightText || '#888'}
            />
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={fullMapVisible && hasMapCoords}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeFullMap}
      >
        <View style={styles.fullMapContainer}>
          <MapView
            key={fullMapVisible ? 'full-map-open' : 'full-map-closed'}
            ref={fullMapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.fullMap}
            initialRegion={regionForCoords(lat, lng, DEFAULT_MAP_DELTA)}
            scrollEnabled
            zoomEnabled
            zoomTapEnabled
            rotateEnabled={false}
            pitchEnabled={false}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              tracksViewChanges={false}
            />
          </MapView>

          <SafeAreaView style={styles.fullMapOverlay} edges={['top', 'bottom']}>
            <View style={styles.fullMapHeader}>
              <Pressable
                onPress={closeFullMap}
                style={({ pressed }) => [
                  styles.fullMapHeaderButton,
                  pressed && styles.mapExpandButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.zoomControls}>
              <Pressable
                onPress={() => adjustMapZoom(true)}
                style={({ pressed }) => [
                  styles.zoomButton,
                  pressed && styles.zoomButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('providerDetails.zoomIn')}
              >
                <VectoreIcons
                  name="add"
                  icon="Ionicons"
                  size={theme.SF(22)}
                  color={theme.colors.text}
                />
              </Pressable>
              <Pressable
                onPress={() => adjustMapZoom(false)}
                style={({ pressed }) => [
                  styles.zoomButton,
                  pressed && styles.zoomButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('providerDetails.zoomOut')}
              >
                <VectoreIcons
                  name="remove"
                  icon="Ionicons"
                  size={theme.SF(22)}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={openInMaps}
              style={({ pressed }) => [
                styles.fullMapOpenRow,
                pressed && styles.mapOpenRowPressed,
              ]}
            >
              <VectoreIcons
                name="map-outline"
                icon="Ionicons"
                size={theme.SF(18)}
                color={theme.colors.primary}
              />
              <CustomText style={styles.mapOpenText}>
                {t('providerDetails.openInMaps')}
              </CustomText>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>

      {/* About Us */}
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>About Us</CustomText>
        <CustomText style={styles.aboutText}>{aboutUs}</CustomText>
      </View>

      {/* Members (e.g. team list) */}
      {membersSection}

      {/* Contact */}
      {phoneNumber && (
        <View style={styles.section}>
          <View style={styles.contactRow}>
            <CustomText style={styles.phoneNumber}>{phoneNumber}</CustomText>
            {onCall && (
              <CustomButton
                title="Call"
                onPress={onCall}
                buttonStyle={styles.callButton}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.whitetext}
                paddingHorizontal={theme.SW(24)}
              />
            )}
          </View>
        </View>
      )}

      {/* Social Links */}
      {(facebookUrl || instagramUrl || websiteUrl) && (
        <View style={styles.section}>
          <View style={styles.socialContainer}>
            {facebookUrl && (
              <Pressable
                style={styles.socialButton}
                onPress={() => openExternalUrl(facebookUrl)}
              >
                <VectoreIcons
                  name="logo-facebook"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.primary}
                />
              </Pressable>
            )}
            {instagramUrl && (
              <Pressable
                style={styles.socialButton}
                onPress={() => openExternalUrl(instagramUrl)}
              >
                <VectoreIcons
                  name="logo-instagram"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.primary}
                />
              </Pressable>
            )}
            {websiteUrl && (
              <Pressable
                style={styles.socialButton}
                onPress={() => openExternalUrl(websiteUrl)}
              >
                <VectoreIcons
                  name="globe-outline"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.primary}
                />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Amenities</CustomText>
          <View style={styles.amenitiesContainer}>
            {amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <VectoreIcons
                  name="checkmark-circle"
                  icon="Ionicons"
                  size={theme.SF(16)}
                  color={theme.colors.primary}
                />
                <CustomText style={styles.amenityText}>{amenity}</CustomText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Service Links */}
      <View style={styles.section}>
        {/* {onServiceFeePress && (
          <Pressable
            style={styles.linkItem}
            onPress={onServiceFeePress}
          >
            <CustomText style={styles.linkText}>
              Service Fee & Policy
            </CustomText>
            <VectoreIcons
              name="chevron-forward"
              icon="Ionicons"
              size={theme.SF(20)}
              color={theme.colors.text}
            />
          </Pressable>
        )} */}
        {onPaymentPolicyPress && (
          <Pressable
            style={styles.linkItem}
            onPress={onPaymentPolicyPress}
          >
            <CustomText style={styles.linkText}>
              Payment & Cancellation Policy
            </CustomText>
            <VectoreIcons
              name="chevron-forward"
              icon="Ionicons"
              size={theme.SF(20)}
              color={theme.colors.text}
            />
          </Pressable>
        )}
        {onReportPress && (
          <Pressable
            style={styles.linkItem}
            onPress={onReportPress}
          >
            <CustomText style={styles.linkText}>Report</CustomText>
            <VectoreIcons
              name="chevron-forward"
              icon="Ionicons"
              size={theme.SF(20)}
              color={theme.colors.text}
            />
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    content: {
      paddingBottom: SH(20),
    },
    mapWrapper: {
      marginHorizontal: SW(20),
      marginTop: SH(16),
      borderRadius: SF(12),
      overflow: 'hidden',
      backgroundColor: Colors.gray || '#E0E0E0',
    },
    map: {
      width: '100%',
      height: SH(200),
    },
    mapExpandButton: {
      position: 'absolute',
      top: SH(10),
      right: SW(10),
      width: SF(36),
      height: SF(36),
      borderRadius: SF(8),
      backgroundColor: Colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    mapExpandButtonPressed: {
      opacity: 0.85,
    },
    fullMapContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    fullMap: {
      ...StyleSheet.absoluteFillObject,
    },
    fullMapOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between',
      pointerEvents: 'box-none',
    },
    fullMapHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: SW(16),
      paddingTop: SH(8),
    },
    fullMapHeaderButton: {
      width: SF(40),
      height: SF(40),
      borderRadius: SF(20),
      backgroundColor: Colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    zoomControls: {
      position: 'absolute',
      right: SW(16),
      top: '40%',
      gap: SH(8),
    },
    zoomButton: {
      width: SF(44),
      height: SF(44),
      borderRadius: SF(8),
      backgroundColor: Colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    zoomButtonPressed: {
      opacity: 0.85,
    },
    fullMapOpenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SW(8),
      marginHorizontal: SW(16),
      marginBottom: SH(12),
      paddingVertical: SH(12),
      paddingHorizontal: SW(16),
      borderRadius: SF(10),
      backgroundColor: Colors.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    mapOpenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SW(8),
      paddingVertical: SH(10),
      backgroundColor: Colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    mapOpenRowPressed: {
      opacity: 0.85,
    },
    mapOpenText: {
      flex: 1,
      fontSize: SF(13),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary || Colors.text,
    },
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(12),
    },
    aboutText: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      lineHeight: SF(20),
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    phoneNumber: {
      fontSize: SF(15),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    callButton: {
      borderRadius: SF(8),
    },
    socialContainer: {
      flexDirection: 'row',
      gap: SW(16),
    },
    socialButton: {
      padding: SW(8),
    },
    amenitiesContainer: {
      gap: SH(8),
    },
    amenityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    amenityText: {
      fontSize: SF(13),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SH(12),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    linkText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
  });
};

