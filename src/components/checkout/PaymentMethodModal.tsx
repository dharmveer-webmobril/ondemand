import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  CustomText,
  CustomButton,
  VectoreIcons,
  Checkbox,
} from '@components/common';
import { FLUTTERWAVE_PAYMENT_ENABLED } from '@services/payment/gatewayPayment';
import { SafeAreaView } from 'react-native-safe-area-context';

export type PaymentMethod = 'paypal' | 'stripe' | 'flutterwave' | 'cash';

type PaymentMethodModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  selectedPaymentMethod?: PaymentMethod;
  /** When provided, only these options are shown (e.g. ['paypal', 'stripe'] for online only) */
  allowedMethods?: PaymentMethod[];
};

const ALL_PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'stripe', label: 'Stripe' },
  { id: 'flutterwave', label: 'Flutterwave' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'cash', label: 'Pay Onsite' },
];

function isPaymentMethodSelectable(methodId: PaymentMethod): boolean {
  if (methodId === 'flutterwave' && !FLUTTERWAVE_PAYMENT_ENABLED) {
    return false;
  }
  return true;
}

export default function PaymentMethodModal({
  visible,
  onClose,
  onConfirm,
  selectedPaymentMethod = 'cash',
  allowedMethods,
}: PaymentMethodModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    selectedPaymentMethod,
  );

  const paymentMethods = useMemo(() => {
    if (allowedMethods && allowedMethods.length > 0) {
      return ALL_PAYMENT_METHODS.filter(m => allowedMethods.includes(m.id));
    }
    return ALL_PAYMENT_METHODS;
  }, [allowedMethods]);

  const defaultMethod = useMemo(() => {
    if (
      paymentMethods.some(m => m.id === 'stripe') &&
      isPaymentMethodSelectable('stripe')
    ) {
      return 'stripe' as PaymentMethod;
    }
    return paymentMethods.find(m => isPaymentMethodSelectable(m.id))?.id ?? 'cash';
  }, [paymentMethods]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const inList = paymentMethods.some(m => m.id === selectedPaymentMethod);
    const selectable =
      inList && isPaymentMethodSelectable(selectedPaymentMethod);
    if (selectable) {
      setSelectedMethod(selectedPaymentMethod);
      return;
    }
    setSelectedMethod(defaultMethod);
  }, [
    visible,
    selectedPaymentMethod,
    defaultMethod,
    paymentMethods,
    FLUTTERWAVE_PAYMENT_ENABLED,
  ]);

  const handleConfirm = () => {
    if (!isPaymentMethodSelectable(selectedMethod)) {
      return;
    }
    onConfirm(selectedMethod);
    onClose();
  };

  // const renderPaymentIcon = (method: PaymentMethod) => {
  //   switch (method) {
  //     case 'paypal':
  //       return (
  //         <View style={styles.paymentIconContainer}>
  //           <CustomText style={styles.paypalLogo}>PayPal</CustomText>
  //         </View>
  //       );
  //     case 'stripe':
  //       return (
  //         <View style={[styles.paymentIconContainer, styles.stripeIconContainer]}>
  //           <CustomText style={styles.stripeLogo}>S</CustomText>
  //         </View>
  //       );
  //     case 'cash':
  //       return (
  //         <View style={styles.paymentIconContainer}>
  //           <VectoreIcons
  //             name="cash"
  //             icon="Ionicons"
  //             size={theme.SF(24)}
  //             color={theme.colors.primary}
  //           />
  //         </View>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.header}>
              <CustomText style={styles.title}>
                {(allowedMethods?.length ?? 0) >= 2 &&
                !allowedMethods?.includes('cash')
                  ? 'Pay with card'
                  : 'Select payment method'}
              </CustomText>
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
              {paymentMethods.map(method => {
                const isDisabled = !isPaymentMethodSelectable(method.id);
                const isSelected = selectedMethod === method.id;
                return (
                  <Pressable
                    key={method.id}
                    disabled={isDisabled}
                    style={[
                      styles.paymentOptionCard,
                      isSelected && styles.paymentOptionCardSelected,
                      isDisabled && styles.paymentOptionCardDisabled,
                    ]}
                    onPress={() => setSelectedMethod(method.id)}
                  >
                    <View style={styles.paymentOptionContent}>
                      <CustomText
                        style={[
                          styles.paymentOptionText,
                          isDisabled && styles.paymentOptionTextDisabled,
                        ]}
                      >
                        {method.label}
                      </CustomText>
                    </View>
                    <View pointerEvents={isDisabled ? 'none' : 'auto'}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {
                          if (!isDisabled) {
                            setSelectedMethod(method.id);
                          }
                        }}
                        size={theme.SF(18)}
                      />
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
              textColor={theme.colors.white}
            />
          </Pressable>
        </Pressable>
      </SafeAreaView>
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
    paymentOptionCardDisabled: {
      opacity: 0.45,
    },
    paymentOptionTextDisabled: {
      color: Colors.gray || '#888888',
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
      // paddingVertical: SH(14),
    },
  });
};
