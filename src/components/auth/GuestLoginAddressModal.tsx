import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomText, VectoreIcons } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';

type GuestLoginAddressModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddAddress: () => void;
  onUseCurrentLocation: () => void;
  isLoading?: boolean;
  loadingMessage?: string;
};

export default function GuestLoginAddressModal({
  visible,
  onClose,
  onAddAddress,
  onUseCurrentLocation,
  isLoading = false,
  loadingMessage,
}: GuestLoginAddressModalProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <CustomText style={styles.loadingTitle}>
                {loadingMessage || t('guest.settingUpGuest')}
              </CustomText>
              <CustomText style={styles.loadingMessage}>
                {t('guest.pleaseWait')}
              </CustomText>
            </View>
          ) : (
            <>
              <View style={styles.iconWrap}>
                <VectoreIcons
                  icon="Ionicons"
                  name="location-outline"
                  size={theme.SF(36)}
                  color={theme.colors.primary}
                />
              </View>

              <CustomText style={styles.title}>{t('guest.addressModalTitle')}</CustomText>
              <CustomText style={styles.message}>
                {t('guest.addressModalMessage')}
              </CustomText>

              <CustomButton
                title={t('guest.addAddress')}
                onPress={onAddAddress}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.whitetext}
                buttonStyle={styles.primaryButton}
              />

              <CustomButton
                title={t('guest.useCurrentLocation')}
                onPress={onUseCurrentLocation}
                backgroundColor={theme.colors.white}
                textColor={theme.colors.primary}
                buttonStyle={styles.secondaryButton}
              />

              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <CustomText style={styles.cancelText}>{t('common.cancel')}</CustomText>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.SW(24),
    },
    card: {
      width: '100%',
      backgroundColor: theme.colors.white,
      borderRadius: theme.SW(16),
      paddingHorizontal: theme.SW(22),
      paddingVertical: theme.SH(24),
      alignItems: 'center',
    },
    iconWrap: {
      width: theme.SF(72),
      height: theme.SF(72),
      borderRadius: theme.SF(36),
      backgroundColor: theme.colors.primary + '14',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.SH(16),
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.SH(8),
    },
    message: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      textAlign: 'center',
      lineHeight: theme.SF(20),
      marginBottom: theme.SH(20),
    },
    primaryButton: {
      width: '100%',
      marginBottom: theme.SH(10),
    },
    secondaryButton: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      marginBottom: theme.SH(8),
    },
    cancelBtn: {
      paddingVertical: theme.SH(10),
      paddingHorizontal: theme.SW(16),
    },
    cancelText: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.lightText,
    },
    loadingWrap: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: theme.SH(16),
    },
    loadingTitle: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: theme.SH(16),
      marginBottom: theme.SH(6),
    },
    loadingMessage: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
      textAlign: 'center',
      lineHeight: theme.SF(20),
    },
  });
