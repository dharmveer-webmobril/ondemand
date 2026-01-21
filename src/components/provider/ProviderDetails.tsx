import { View, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useMemo } from 'react';
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
};

export default function ProviderDetails({
  aboutUs = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  phoneNumber,
  onCall,
  facebookUrl,
  instagramUrl,
  websiteUrl,
  amenities = [],
  onServiceFeePress,
  onPaymentPolicyPress,
  onReportPress,
  refreshControl,
}: ProviderDetailsProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <CustomText style={styles.mapPlaceholder}>Map View</CustomText>
        <CustomText style={styles.mapSubtext}>
          Location will be displayed here
        </CustomText>
      </View>

      {/* About Us */}
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>About Us</CustomText>
        <CustomText style={styles.aboutText}>{aboutUs}</CustomText>
      </View>

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
        {onServiceFeePress && (
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
        )}
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
    mapContainer: {
      height: SH(200),
      backgroundColor: Colors.gray || '#E0E0E0',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: SW(20),
      marginTop: SH(16),
      borderRadius: SF(12),
    },
    mapPlaceholder: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(4),
    },
    mapSubtext: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
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

