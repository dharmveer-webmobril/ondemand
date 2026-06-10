import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppHeader, Container, CustomText } from '@components/common';
import { showToast } from '@components/common/CustomToast';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { disableBiometric, enableBiometric } from '@store/slices/authSlice';
import {
  authenticateWithBiometrics,
  BiometricError,
  checkBiometricAvailability,
  getBiometricLabel,
} from '@services/auth/biometricService';
import { hasTokenInKeychain } from '@services/auth/keychainService';

export default function SecuritySettings() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const biometricEnabled = useAppSelector((state) => state.auth.biometricEnabled);
  const [isUpdating, setIsUpdating] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');

  useEffect(() => {
    (async () => {
      const { available, biometryType } = await checkBiometricAvailability();
      if (available) {
        setBiometricLabel(getBiometricLabel(biometryType));
      }
    })();
  }, []);

  const handleToggle = useCallback(
    async (enabled: boolean) => {
      if (isUpdating) {
        return;
      }

      setIsUpdating(true);

      try {
        if (enabled) {
          const tokenExists = await hasTokenInKeychain();
          if (!tokenExists) {
            showToast({
              type: 'error',
              title: t('messages.error'),
              message: t('biometric.tokenMissing'),
            });
            return;
          }

          const { available } = await checkBiometricAvailability();
          if (!available) {
            showToast({
              type: 'error',
              title: t('messages.error'),
              message: t('biometric.notAvailable'),
            });
            return;
          }

          await authenticateWithBiometrics(t('biometric.enablePromptMessage'));
          dispatch(enableBiometric());

          showToast({
            type: 'success',
            title: t('messages.success'),
            message: t('biometric.enabledSuccess'),
          });
        } else {
          dispatch(disableBiometric());

          showToast({
            type: 'success',
            title: t('messages.success'),
            message: t('biometric.disabledSuccess'),
          });
        }
      } catch (error) {
        if (error instanceof BiometricError && error.code === 'CANCELLED') {
          return;
        }

        showToast({
          type: 'error',
          title: t('messages.error'),
          message:
            error instanceof BiometricError
              ? error.message
              : t('messages.somethingWentWrong'),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [dispatch, isUpdating, t],
  );

  return (
    <Container safeArea style={styles.container}>
      <AppHeader
        title={t('security.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
        containerStyle={styles.headerContainer}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CustomText style={styles.sectionTitle}>{t('security.sectionTitle')}</CustomText>

        <View style={styles.toggleItem}>
          <View style={styles.toggleTextContainer}>
            <CustomText style={styles.toggleLabel}>
              {t('security.enableBiometricLogin')}
            </CustomText>
            <CustomText style={styles.toggleDescription}>
              {t('security.enableBiometricDescription', { type: biometricLabel })}
            </CustomText>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleToggle}
            disabled={isUpdating}
            trackColor={{
              false: theme.colors.lightText,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
      paddingHorizontal: theme.SW(20),
    },
    headerContainer: {
      paddingHorizontal: 0,
    },
    scrollContent: {
      paddingTop: theme.SH(20),
      paddingBottom: theme.SH(20),
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(16),
    },
    toggleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.SW(16),
      gap: theme.SW(12),
    },
    toggleTextContainer: {
      flex: 1,
    },
    toggleLabel: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
      marginBottom: theme.SH(4),
    },
    toggleDescription: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText,
    },
  });
