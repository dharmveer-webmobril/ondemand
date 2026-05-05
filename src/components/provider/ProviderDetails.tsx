import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Platform,
  Linking,
} from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';

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

  const lat = latitude != null ? Number(latitude) : NaN;
  const lng = longitude != null ? Number(longitude) : NaN;
  const hasMapCoords = Number.isFinite(lat) && Number.isFinite(lng);

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
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            }}
            scrollEnabled={false}
            zoomTapEnabled
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
              <Pressable style={styles.socialButton}>
                <VectoreIcons
                  name="logo-facebook"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.primary}
                />
              </Pressable>
            )}
            {instagramUrl && (
              <Pressable style={styles.socialButton}>
                <VectoreIcons
                  name="logo-instagram"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.primary}
                />
              </Pressable>
            )}
            {websiteUrl && (
              <Pressable style={styles.socialButton}>
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

