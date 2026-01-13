import { View, StyleSheet, Modal, Pressable } from 'react-native';
import React, { useMemo, useState } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton } from '@components/common';
import VectoreIcons from '@components/common/VectoreIcons';

type DeliveryMode = 'at_home' | 'online' | 'on_premises';

type DeliveryModeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (mode: DeliveryMode) => void;
  selectedMode?: DeliveryMode;
};

export default function DeliveryModeModal({
  visible,
  onClose,
  onConfirm,
  selectedMode = 'at_home',
}: DeliveryModeModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentMode, setCurrentMode] = useState<DeliveryMode>(selectedMode);

  const deliveryModes = [
    { id: 'at_home' as DeliveryMode, label: 'At Home', icon: 'home' },
    { id: 'online' as DeliveryMode, label: 'Online', icon: 'laptop' },
    { id: 'on_premises' as DeliveryMode, label: 'On Premises', icon: 'storefront' },
  ];

  const handleConfirm = () => {
    onConfirm(currentMode);
    onClose();
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
            <CustomText style={styles.title}>Select Delivery Mode</CustomText>

            <View style={styles.optionsContainer}>
              {deliveryModes.map((mode) => {
                const isSelected = currentMode === mode.id;
                return (
                  <Pressable
                    key={mode.id}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.selectedOption,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => setCurrentMode(mode.id)}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.radioButton,
                          isSelected && styles.radioButtonSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioButtonInner} />}
                      </View>
                      <VectoreIcons
                        name={mode.icon}
                        icon="MaterialIcons"
                        size={theme.SF(24)}
                        color={isSelected ? theme.colors.primary : theme.colors.text}
                      />
                      <CustomText
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                        ]}
                      >
                        {mode.label}
                      </CustomText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <CustomButton
              title="Confirm"
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
    title: {
      fontSize: SF(18),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      textAlign: 'center',
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

