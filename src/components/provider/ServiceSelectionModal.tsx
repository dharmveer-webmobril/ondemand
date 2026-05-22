import { View, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';
import {
  isServiceRoutineEnabled,
  serviceSupportsDeliveryPreference,
  formatDeliveryPreferenceLabel,
} from '@utils/serviceRoutineConfig';
import type { BookingType } from './BookAppointmentBookingTypeSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceNameWithRoutineBadge from './ServiceNameWithRoutineBadge';

type Service = {
  _id: string;
  name: string;
  price: number;
  time: number;
  preferences?: string[];
  serviceAddOns?: any[];
  images?: string[];
  routineConfig?: { enabled?: boolean };
};

type ServiceSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedServiceIds: string[]) => void;
  services: Service[];
  selectedServiceIds: string[];
  bookingType?: BookingType;
  deliveryMode?: string;
  restrictToRoutineServices?: boolean;
};

export default function ServiceSelectionModal({
  visible,
  onClose,
  onConfirm,
  services,
  selectedServiceIds,
  bookingType = 'single',
  deliveryMode = '',
  restrictToRoutineServices = false,
}: ServiceSelectionModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedServiceIds);

  const isRoutineMode =
    restrictToRoutineServices || bookingType === 'routine';

  const preferenceLabel = formatDeliveryPreferenceLabel(deliveryMode);

  useEffect(() => {
    if (!visible) return;

    if (isRoutineMode) {
      const allowed = selectedServiceIds.filter(id => {
        const service = services.find(s => s._id === id);
        return service && isServiceRoutineEnabled(service);
      });
      setSelectedIds(allowed);
      return;
    }

    const allowed = selectedServiceIds.filter(id => {
      const service = services.find(s => s._id === id);
      return (
        service && serviceSupportsDeliveryPreference(service, deliveryMode)
      );
    });
    setSelectedIds(allowed);
  }, [
    visible,
    selectedServiceIds,
    isRoutineMode,
    services,
    deliveryMode,
  ]);

  const handleToggleService = (item: Service) => {
    const routineAvailable = isServiceRoutineEnabled(item);
    const preferenceOk = serviceSupportsDeliveryPreference(item, deliveryMode);

    if (isRoutineMode) {
      if (!routineAvailable) return;
    } else if (!preferenceOk) {
      return;
    }

    const serviceId = item._id;
    setSelectedIds((prev: string[]) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id: string) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    onConfirm(selectedIds);
    onClose();
  };

  const renderServiceItem = ({ item }: { item: Service }) => {
    const isSelected = selectedIds.includes(item._id);
    const routineAvailable = isServiceRoutineEnabled(item);
    const preferenceOk = serviceSupportsDeliveryPreference(item, deliveryMode);

    let disabled = false;
    let disabledReason: 'routine' | 'preference' | null = null;

    if (isRoutineMode) {
      if (!routineAvailable) {
        disabled = true;
        disabledReason = 'routine';
      }
    } else if (!preferenceOk) {
      disabled = true;
      disabledReason = 'preference';
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.serviceItem,
          isSelected && !disabled && styles.selectedServiceItem,
          disabled && styles.serviceItemDisabled,
          pressed && !disabled && { opacity: 0.7 },
        ]}
        onPress={() => handleToggleService(item)}
        disabled={disabled}
      >
        <View style={styles.serviceContent}>
          <View
            style={[
              styles.checkbox,
              isSelected && !disabled && styles.checkboxSelected,
              disabled && styles.checkboxDisabled,
            ]}
          >
            {isSelected && !disabled && (
              <VectoreIcons
                name="checkmark"
                icon="Ionicons"
                size={theme.SF(16)}
                color={theme.colors.white}
              />
            )}
          </View>
          <View style={styles.serviceInfo}>
            <ServiceNameWithRoutineBadge
              name={item.name}
              service={item}
              numberOfLines={2}
              nameStyle={[
                styles.serviceName,
                isSelected && !disabled && styles.selectedServiceName,
                disabled && styles.serviceNameDisabled,
              ]}
              containerStyle={styles.serviceNameBlock}
            />
            <CustomText
              style={[
                styles.servicePrice,
                disabled && styles.serviceNameDisabled,
              ]}
            >
              ${item.price.toFixed(2)} • {item.time}m
            </CustomText>
            {disabledReason === 'routine' ? (
              <CustomText style={styles.unavailableLabel}>
                {t('bookAppointment.routineNotAvailable')}
              </CustomText>
            ) : null}
            {disabledReason === 'preference' ? (
              <CustomText style={styles.unavailableLabel}>
                {t('bookAppointment.preferenceNotAvailable', {
                  preference: preferenceLabel,
                })}
              </CustomText>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

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
          <Pressable
            style={styles.modalContainer}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <CustomText style={styles.title}>Select Services</CustomText>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <VectoreIcons
                    name="close"
                    icon="Ionicons"
                    size={theme.SF(24)}
                    color={theme.colors.text}
                  />
                </Pressable>
              </View>

              {isRoutineMode ? (
                <CustomText style={styles.hint}>
                  {t('bookAppointment.routineOnlyServicesHint')}
                </CustomText>
              ) : (
                <CustomText style={styles.hint}>
                  {t('bookAppointment.singlePreferenceHint', {
                    preference: preferenceLabel,
                  })}
                </CustomText>
              )}

              <FlatList
                data={services}
                keyExtractor={item => item._id}
                renderItem={renderServiceItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />

              <CustomButton
                title={t('category.confirm') || 'Confirm'}
                onPress={handleConfirm}
                buttonStyle={styles.confirmButton}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.whitetext}
              />
            </View>
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      maxHeight: '80%',
      flex: 1,
      borderTopLeftRadius: SF(20),
      borderTopRightRadius: SF(20),
      backgroundColor: Colors.white,
      paddingTop: SH(20),
      paddingBottom: SH(30),
      paddingHorizontal: SW(20),
    },
    content: {
      flex: 1,
      gap: SH(20),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: SF(18),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: SW(4),
    },
    hint: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
      lineHeight: SF(18),
    },
    listContent: {
      paddingVertical: SH(10),
      gap: SH(12),
    },
    serviceItem: {
      padding: SW(16),
      borderRadius: SF(12),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      backgroundColor: Colors.background || '#F5F5F5',
    },
    selectedServiceItem: {
      borderColor: Colors.primary,
      backgroundColor: Colors.secondary || '#E3F2FD',
    },
    serviceItemDisabled: {
      opacity: 0.42,
      backgroundColor: Colors.background || '#F0F0F0',
      borderColor: Colors.gray || '#DDD',
    },
    checkboxDisabled: {
      borderColor: Colors.gray || '#CCC',
      backgroundColor: Colors.background || '#EEE',
    },
    serviceNameDisabled: {
      color: Colors.lightText || '#999',
    },
    unavailableLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.errorText || '#C0392B',
      marginTop: SH(4),
    },
    serviceContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(12),
    },
    checkbox: {
      width: SF(20),
      height: SF(20),
      borderRadius: SF(4),
      borderWidth: 2,
      borderColor: Colors.gray || '#999',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.white,
    },
    checkboxSelected: {
      borderColor: Colors.primary,
      backgroundColor: Colors.primary,
    },
    serviceInfo: {
      flex: 1,
      minWidth: 0,
    },
    serviceNameBlock: {
      marginBottom: SH(4),
    },
    serviceName: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      lineHeight: SF(22),
    },
    selectedServiceName: {
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    servicePrice: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    confirmButton: {
      borderRadius: SF(12),
      marginTop: SH(10),
    },
  });
};
