import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomText } from '@components/common';
import { useThemeContext } from '@utils/theme';
import type { ThemeType } from '@utils/theme';

interface BiometricSetupModalProps {
  visible: boolean;
  isLoading?: boolean;
  onEnable: () => void;
  onMaybeLater: () => void;
}

export default function BiometricSetupModal({
  visible,
  isLoading = false,
  onEnable,
  onMaybeLater,
}: BiometricSetupModalProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={visible}
      animationType="slide"
      onRequestClose={onMaybeLater}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <Pressable style={styles.overlay} onPress={onMaybeLater}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.content}
            colors={theme.colors.gradientColor}
          >
            <View style={styles.modalContent}>
              <CustomText style={styles.title}>{t('biometric.setupTitle')}</CustomText>
              <CustomText style={styles.subtitle}>{t('biometric.setupSubtitle')}</CustomText>

              <View style={styles.buttonsContainer}>
                <CustomButton
                  title={t('biometric.enable')}
                  backgroundColor={theme.colors.white}
                  textColor={theme.colors.primary}
                  onPress={onEnable}
                  isLoading={isLoading}
                  disable={isLoading}
                />
                <CustomButton
                  title={t('biometric.maybeLater')}
                  onPress={onMaybeLater}
                  disable={isLoading}
                  buttonTextStyle={styles.secondaryButtonText}
                />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    content: {
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
    },
    modalContent: {
      paddingTop: theme.SH(30),
      paddingBottom: theme.SH(50),
      paddingHorizontal: theme.SW(20),
    },
    title: {
      fontSize: theme.fontSize.xxl,
      color: theme.colors.white,
      fontFamily: theme.fonts.BOLD,
      marginBottom: theme.SH(15),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.white,
      fontFamily: theme.fonts.MEDIUM,
      marginBottom: theme.SH(30),
      textAlign: 'center',
    },
    buttonsContainer: {
      gap: theme.SH(12),
    },
    secondaryButtonText: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.BOLD,
    },
  });
