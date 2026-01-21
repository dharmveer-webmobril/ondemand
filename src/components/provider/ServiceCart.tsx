import { View, StyleSheet, Pressable } from 'react-native';
import  { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import imagePaths from '@assets';

type Service = {
  _id: string;
  name: string;
  price: number;
  time: number;
  serviceAddOns?: any[];
  selectedAddOns?: any[];
  images?: string[];
};

type ServiceCartProps = {
  services: Service[];
  onRemoveService: (serviceId: string) => void;
  onAddAddOns: (service: Service) => void;
  onAddService: () => void;
};

export default function ServiceCart({
  services,
  onRemoveService,
  onAddAddOns,
  onAddService,
}: ServiceCartProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const calculateServiceTotal = (service: Service) => {
    const basePrice = service.price || 0;
    const addOnsPrice = service.selectedAddOns?.reduce((sum: number, addOn: any) => sum + (addOn.price || 0), 0) || 0;
    return basePrice + addOnsPrice;
  };

  const calculateServiceDuration = (service: Service) => {
    const baseDuration = service.time || 0;
    const addOnsDuration = service.selectedAddOns?.reduce((sum: number, addOn: any) => sum + (addOn.duration || 0), 0) || 0;
    return baseDuration + addOnsDuration;
  };

  return (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>Selected Services</CustomText>
      {services.map((service) => {
        const serviceTotalPrice = calculateServiceTotal(service);
        const serviceTotalDuration = calculateServiceDuration(service);
        const serviceImage = service?.images?.[0] ? { uri: service?.images?.[0] } : imagePaths.no_image;
        return (
          <View key={service._id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceImageContainer}>
                <ImageLoader
                  source={serviceImage}
                  mainImageStyle={styles.serviceImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.serviceDetails}>
                <CustomText style={styles.serviceName}>{service?.name}</CustomText>
                <CustomText style={styles.servicePrice}>
                  ${serviceTotalPrice.toFixed(2)} • {serviceTotalDuration}m
                </CustomText>
              </View>
            </View>
            {service.selectedAddOns && service.selectedAddOns.length > 0 && <View style={styles.divider} />}
            {/* Selected Add-ons */}
            {service.selectedAddOns && service.selectedAddOns.length > 0 && (
              <View style={styles.addOnsContainer}>
                {service.selectedAddOns.map((addOn: any) => (
                  <View key={addOn._id} style={styles.addOnTag}>
                    <CustomText style={styles.addOnTagText}>
                      {addOn.name} (+${addOn.price?.toFixed(2)})
                    </CustomText>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.serviceActions}>
              {service.serviceAddOns && service.serviceAddOns.length > 0 && (
                <Pressable
                  onPress={() => onAddAddOns(service)}
                  style={styles.addAddOnButton}
                >
                  <CustomText style={styles.addAddOnText}>Add Add-ons</CustomText>
                </Pressable>
              )}
            </View>
            {services.length > 1 && (
              <Pressable
                onPress={() => onRemoveService(service._id)}
                style={styles.removeButton}
              >
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={theme.SF(18)}
                  color={theme.colors.white}
                />
              </Pressable>
            )}
          </View>
        );
      })}
      <Pressable style={styles.addServiceButton} onPress={onAddService}>
        <CustomText style={styles.addServiceText}>+ Add another service</CustomText>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(20),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(16),
    },
    serviceCard: {
      padding: SW(12),
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(8),
      marginBottom: SH(8),
    },
    serviceInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    serviceDetails: {
      marginLeft: SW(12),
      flex: 1,
    },
    serviceName: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(2),
    },
    servicePrice: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(8),
    },
    addOnsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SW(8),
      marginTop: SH(4),
    },
    addOnTag: {
      backgroundColor: Colors.secondary || '#E3F2FD',
      paddingHorizontal: SW(8),
      paddingVertical: SH(4),
      borderRadius: SF(4),
    },
    addOnTagText: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.primary,
    },
    serviceActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: SH(8),
      gap: SW(8),
    },
    addAddOnButton: {
      paddingHorizontal: SW(12),
      paddingVertical: SH(2),
      backgroundColor: Colors.primary,
      borderRadius: SF(6),
    },
    addAddOnText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.white,
    },
    removeButton: {
      padding: SW(4),
      position: 'absolute',
      right: 0,
      backgroundColor: Colors.primary,
      top: 0,
      zIndex: 99999,
      borderTopRightRadius: SF(8),
    },
    addServiceButton: {
      paddingVertical: SH(8),
    },
    addServiceText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    serviceImageContainer: {
      width: SW(40),
      height: SH(40),
      borderRadius: SF(20),
      overflow: 'hidden',
    },
    serviceImage: {
      width: '100%',
      height: '100%',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.gray,
      marginVertical: theme.SH(8),
    },
  });
};
