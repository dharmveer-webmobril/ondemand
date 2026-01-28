import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { CustomText, CustomButton, CustomInput, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type CancelBookingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
  title?: string;
  message?: string;
};

export default function CancelBookingModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  title = 'Cancel Booking',
  message = 'Please provide a reason for canceling (required)',
}: CancelBookingModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [reason, setReason] = useState('');

  const handleSubmit = useCallback(() => {
    if (reason.trim()) {
      onSubmit(reason.trim());
    }
  }, [reason, onSubmit]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setReason('');
      onClose();
    }
  }, [onClose, isLoading]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <CustomText
              fontSize={theme.fontSize.lg}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.text}
            >
              {title}
            </CustomText>
            <Pressable onPress={handleClose} style={styles.closeButton} disabled={isLoading}>
              <VectoreIcons
                name="close"
                icon="Ionicons"
                size={theme.SF(24)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.lightText}
              style={{ marginBottom: theme.SH(12) }}
            >
              {message}
            </CustomText>
            <CustomInput
              placeholder="Enter reason for canceling..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              maxLength={500}
              inputTheme="default"
              withBackground={theme.colors.secondary}
              isEditable={!isLoading}
            />
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <CustomButton
              title="Cancel"
              onPress={handleClose}
              backgroundColor={theme.colors.secondary}
              textColor={theme.colors.text}
              buttonStyle={styles.cancelButton}
              disable={isLoading}
            />
            <CustomButton
              title="Confirm"
              onPress={handleSubmit}
              backgroundColor={theme.colors.red || '#F44336'}
              textColor={theme.colors.white}
              buttonStyle={styles.confirmButton}
              disable={!reason.trim() || isLoading}
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.xl,
      width: '90%',
      maxWidth: theme.SW(400),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.SW(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    closeButton: {
      width: theme.SF(32),
      height: theme.SF(32),
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.SW(16),
    },
    footer: {
      flexDirection: 'row',
      padding: theme.SW(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
      gap: theme.SW(8),
    },
    cancelButton: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
    },
    confirmButton: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
    },
  });
