import { View, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons } from '@components/common';

type AddOn = {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  discountPercentage?: number;
};

type AddOnSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedAddOnIds: string[]) => void;
  addOns: AddOn[];
  selectedAddOnIds?: string[];
};

export default function AddOnSelectionModal({
  visible,
  onClose,
  onConfirm,
  addOns,
  selectedAddOnIds = [],
}: AddOnSelectionModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = React.useState<string[]>(selectedAddOnIds);

  React.useEffect(() => {
    if (visible) {
      setSelectedIds(selectedAddOnIds);
    }
  }, [visible, selectedAddOnIds]);

  const handleToggleAddOn = (addOnId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(addOnId)) {
        return prev.filter((id) => id !== addOnId);
      } else {
        return [...prev, addOnId];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onClose();
  };

  const getAddOnDisplayPrice = (addOn: AddOn | null | undefined) => {
    if (addOn == null) return { original: 0, discounted: 0, discountPct: 0, hasDiscount: false };
    const price = Number(addOn?.price) || 0;
    const discountPct = Math.min(100, Math.max(0, Number(addOn?.discountPercentage) || 0));
    const discounted = price * (1 - discountPct / 100);
    return {
      original: price,
      discounted: Number.isFinite(discounted) ? discounted : price,
      discountPct,
      hasDiscount: discountPct > 0,
    };
  };

  const renderAddOnItem = ({ item }: { item: AddOn }) => {
    if (item == null) return null;
    const isSelected = selectedIds.includes(item?._id ?? '');
    const { original, discounted, discountPct, hasDiscount } = getAddOnDisplayPrice(item);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.addOnItem,
          isSelected && styles.selectedAddOnItem,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleToggleAddOn(item?._id ?? '')}
      >
        <View style={styles.addOnContent}>
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
          <View style={styles.addOnInfo}>
            <CustomText
              style={[
                styles.addOnName,
                ...(isSelected ? [styles.selectedAddOnName] : []),
              ]}
            >
              {item?.name ?? ''}
            </CustomText>
            {item.description && (
              <CustomText style={styles.addOnDescription} numberOfLines={2}>
                {item.description}
              </CustomText>
            )}
            <View style={styles.priceRow}>
              <CustomText style={styles.addOnPrice}>
                ${(Number.isFinite(original) ? original : 0).toFixed(2)}
                {hasDiscount ? ` → $${(Number.isFinite(discounted) ? discounted : original).toFixed(2)} (${discountPct}% off)` : ''}
                {' • '}{item?.duration ?? 0}m
              </CustomText>
            </View>
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
              <CustomText style={styles.title}>Select Add-ons</CustomText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <VectoreIcons
                  name="close"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            {(Array.isArray(addOns) ? addOns : []).length === 0 ? (
              <View style={styles.emptyContainer}>
                <CustomText style={styles.emptyText}>No add-ons available</CustomText>
              </View>
            ) : (
              <FlatList
                data={Array.isArray(addOns) ? addOns : []}
                keyExtractor={(item) => item?._id ?? ''}
                renderItem={renderAddOnItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}

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
      flex: 1,
      width: '100%',
      maxHeight: '80%',
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
    addOnItem: {
      padding: SW(16),
      borderRadius: SF(12),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      backgroundColor: Colors.background || '#F5F5F5',
    },
    selectedAddOnItem: {
      borderColor: Colors.primary,
      backgroundColor: Colors.secondary || '#E3F2FD',
    },
    addOnContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
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
      marginTop: SH(2),
    },
    checkboxSelected: {
      borderColor: Colors.primary,
      backgroundColor: Colors.primary,
    },
    addOnInfo: {
      flex: 1,
    },
    addOnName: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(4),
    },
    selectedAddOnName: {
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    addOnDescription: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(4),
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
      flexWrap: 'wrap',
    },
    addOnPrice: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    discountBadge: {
      fontSize: SF(12),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    originalPriceLine: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
      marginTop: SH(2),
    },
    emptyContainer: {
      paddingVertical: SH(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    confirmButton: {
      borderRadius: SF(12),
      marginTop: SH(10),
    },
  });
};
