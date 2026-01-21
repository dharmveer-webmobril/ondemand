import { View, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';

type Service = {
  _id: string;
  name: string;
  price: number;
  time: number;
  serviceAddOns?: any[];
  images?: string[];
};

type ServiceSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedServiceIds: string[]) => void;
  services: Service[];
  selectedServiceIds: string[];
};

export default function ServiceSelectionModal({
  visible,
  onClose,
  onConfirm,
  services,
  selectedServiceIds,
}: ServiceSelectionModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedServiceIds);

  useEffect(() => {
    if (visible) {
      setSelectedIds(selectedServiceIds);
    }
  }, [visible, selectedServiceIds]);

  const handleToggleService = (serviceId: string) => {
    setSelectedIds((prev: string[]) => {
      if (prev.includes(serviceId)) {
        // Prevent deselecting if only one service is selected (mandatory minimum)
        if (prev.length === 1) {
          return prev; // Keep at least one selected
        }
        return prev.filter((id: string) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleConfirm = () => {
    // Ensure at least one service is selected
    if (selectedIds.length === 0) {
      return; // Don't allow confirming with no services
    }
    onConfirm(selectedIds);
    onClose();
  };

  const renderServiceItem = ({ item }: { item: Service }) => {
    const isSelected = selectedIds.includes(item._id);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.serviceItem,
          isSelected && styles.selectedServiceItem,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleToggleService(item._id)}
      >
        <View style={styles.serviceContent}>
          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}
          >
            {isSelected && (
              <VectoreIcons
                name="checkmark"
                icon="Ionicons"
                size={theme.SF(16)}
                color={theme.colors.white}
              />
            )}
          </View>
          <View style={styles.serviceInfo}>
            <CustomText
              style={[
                styles.serviceName,
                isSelected && styles.selectedServiceName,
              ]}
            >
              {item.name}
            </CustomText>
            <CustomText style={styles.servicePrice}>
              ${item.price.toFixed(2)} • {item.time}m
            </CustomText>
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
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
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

            <FlatList
              data={services}
              keyExtractor={(item) => item._id}
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
    },
    serviceName: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(4),
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
