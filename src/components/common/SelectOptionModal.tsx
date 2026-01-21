import { View, StyleSheet, Modal, Pressable } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';
import VectoreIcons from '@components/common/VectoreIcons';

export type OptionItem = {
  id: string;
  label: string;
  icon: string;
  iconType?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'MaterialCommunityIcons';
};

type SelectOptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedId: string) => void;
  title: string;
  options: OptionItem[];
  selectedValue?: string;
  showCloseButton?: boolean;
  selectionType?: 'radio' | 'checkbox';
};

export default function SelectOptionModal({
  visible,
  onClose,
  onConfirm,
  title,
  options,
  selectedValue,
  showCloseButton = false,
  selectionType = 'radio',
}: SelectOptionModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme, showCloseButton), [theme, showCloseButton]);
  const { t } = useTranslation();
  
  // Store selected value in array inside component
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize selectedIds when modal opens or selectedValue changes
  useEffect(() => {
    if (visible) {
      if (selectedValue) {
        setSelectedIds([selectedValue]);
      } else if (options.length > 0) {
        // Default to first option if no selection
        setSelectedIds([options[0].id]);
      } else {
        setSelectedIds([]);
      }
    }
  }, [visible, selectedValue, options]);

  const handleOptionPress = (optionId: string) => {
    // For single selection (radio), replace array with new selection
    setSelectedIds([optionId]);
  };

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onConfirm(selectedIds[0]); // Return first selected for single selection
      onClose();
    }
  };

  const renderSelectionIndicator = (isSelected: boolean) => {
    if (selectionType === 'checkbox') {
      return (
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
      );
    } else {
      // Radio button
      return (
        <View
          style={[
            styles.radioButton,
            isSelected && styles.radioButtonSelected,
          ]}
        >
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
      );
    }
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
              <CustomText style={styles.title}>{title}</CustomText>
              {showCloseButton && (
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <VectoreIcons
                    name="close"
                    icon="Ionicons"
                    size={theme.SF(24)}
                    color={theme.colors.text}
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.optionsContainer}>
              {options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <Pressable
                    key={option.id}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.selectedOption,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleOptionPress(option.id)}
                  >
                    <View style={styles.optionContent}>
                      {renderSelectionIndicator(isSelected)}
                      <VectoreIcons
                        name={option.icon}
                        icon={option.iconType || 'Ionicons'}
                        size={theme.SF(24)}
                        color={isSelected ? theme.colors.primary : theme.colors.text}
                      />
                      <CustomText
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </CustomText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

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

const createStyles = (theme: ThemeType, showCloseButton?: boolean) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      borderTopLeftRadius: SF(20),
      borderTopRightRadius: SF(20),
      backgroundColor: Colors.white,
      paddingTop: SH(20),
      paddingBottom: SH(30),
      paddingHorizontal: SW(20),
    },
    content: {
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
      flex: showCloseButton ? 1 : 0,
      textAlign: 'center',
    },
    closeButton: {
      padding: SW(4),
    },
    optionsContainer: {
      gap: SH(12),
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SW(16),
      borderRadius: SF(12),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      backgroundColor: Colors.background || '#F5F5F5',
    },
    selectedOption: {
      borderColor: Colors.primary,
      backgroundColor: Colors.secondary || '#E3F2FD',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: SW(12),
    },
    radioButton: {
      width: SF(20),
      height: SF(20),
      borderRadius: SF(10),
      borderWidth: 2,
      borderColor: Colors.gray || '#999',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      borderColor: Colors.primary,
    },
    radioButtonInner: {
      width: SF(10),
      height: SF(10),
      borderRadius: SF(5),
      backgroundColor: Colors.primary,
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
    optionText: {
      flex: 1,
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    selectedOptionText: {
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    confirmButton: {
      borderRadius: SF(12),
      marginTop: SH(10),
    },
  });
};
