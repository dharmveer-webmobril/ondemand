import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, CustomButton, VectoreIcons, Checkbox } from '@components/common';

type PaymentMethod = 'paypal' | 'stripe' | 'cash';

type PaymentMethodModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  selectedPaymentMethod?: PaymentMethod;
};

const paymentMethods = [
  { id: 'paypal' as PaymentMethod, label: 'PayPal' },
  { id: 'stripe' as PaymentMethod, label: 'Stripe' },
  { id: 'cash' as PaymentMethod, label: 'Pay Onsite' },
];

export default function PaymentMethodModal({
  visible,
  onClose,
  onConfirm,
  selectedPaymentMethod = 'cash',
}: PaymentMethodModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(selectedPaymentMethod);

  useEffect(() => {
    if (visible) {
      setSelectedMethod(selectedPaymentMethod);
    }
  }, [visible, selectedPaymentMethod]);

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    onClose();
  };

  const renderPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'paypal':
        return (
          <View style={styles.paymentIconContainer}>
            <CustomText style={styles.paypalLogo}>PayPal</CustomText>
          </View>
        );
      case 'stripe':
        return (
          <View style={[styles.paymentIconContainer, styles.stripeIconContainer]}>
            <CustomText style={styles.stripeLogo}>S</CustomText>
          </View>
        );
      case 'cash':
        return (
          <View style={styles.paymentIconContainer}>
            <VectoreIcons
              name="cash"
              icon="Ionicons"
              size={theme.SF(24)}
              color={theme.colors.primary}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <CustomText style={styles.title}>Online Payment</CustomText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <VectoreIcons
                name="close"
                icon="Ionicons"
                size={theme.SF(24)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.optionsContainer}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <Pressable
                  key={method.id}
                  style={[
                    styles.paymentOptionCard,
                    isSelected && styles.paymentOptionCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={styles.paymentOptionContent}>
                    {renderPaymentIcon(method.id)}
                    <CustomText style={styles.paymentOptionText}>{method.label}</CustomText>
                  </View>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => setSelectedMethod(method.id)}
                    size={theme.SF(18)}
                  />
                </Pressable>
              );
            })}
          </View>

          <CustomButton
            title="Confirm"
            onPress={handleConfirm}
            buttonStyle={styles.confirmButton}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: Colors.white,
      borderTopLeftRadius: SF(20),
      borderTopRightRadius: SF(20),
      paddingHorizontal: SW(20),
      paddingTop: SH(20),
      paddingBottom: SH(30),
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(20),
    },
    title: {
      fontSize: SF(18),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    closeButton: {
      padding: SW(4),
    },
    optionsContainer: {
      gap: SH(12),
      marginBottom: SH(20),
    },
    paymentOptionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.white,
      borderRadius: SF(12),
      padding: SW(16),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
    },
    paymentOptionCardSelected: {
      borderColor: Colors.primary,
      borderWidth: 1.5,
    },
    paymentOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(12),
      flex: 1,
    },
    paymentIconContainer: {
      width: SW(40),
      height: SH(40),
      borderRadius: SF(8),
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stripeIconContainer: {
      backgroundColor: '#635BFF',
    },
    paypalLogo: {
      fontSize: SF(12),
      fontFamily: Fonts.BOLD,
      color: '#003087',
    },
    stripeLogo: {
      fontSize: SF(18),
      fontFamily: Fonts.BOLD,
      color: Colors.white,
    },
    paymentOptionText: {
      fontSize: SF(16),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    confirmButton: {
      borderRadius: SF(12),
      paddingVertical: SH(14),
    },
  });
};
