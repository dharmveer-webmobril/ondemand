import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppDispatch } from '@store/hooks';
import { enableBiometric } from '@store/slices/authSlice';
import BiometricSetupModal from '@components/auth/BiometricSetupModal';
import {
  authenticateWithBiometrics,
  BiometricError,
  checkBiometricAvailability,
} from '@services/auth/biometricService';
import { showToast } from '@components/common/CustomToast';
import { useTranslation } from 'react-i18next';

interface BiometricSetupContextValue {
  promptBiometricSetup: () => Promise<void>;
}

const BiometricSetupContext = createContext<BiometricSetupContextValue | null>(null);

export function BiometricSetupProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const resolverRef = useRef<(() => void) | null>(null);

  const resolvePrompt = useCallback(() => {
    resolverRef.current?.();
    resolverRef.current = null;
    setVisible(false);
    setIsEnabling(false);
  }, []);

  const promptBiometricSetup = useCallback(() => {
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
      setVisible(true);
    });
  }, []);

  const handleEnable = useCallback(async () => {
    setIsEnabling(true);

    try {
      const { available } = await checkBiometricAvailability();

      if (!available) {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: t('biometric.notAvailable'),
        });
        resolvePrompt();
        return;
      }

      await authenticateWithBiometrics(t('biometric.setupPromptMessage'));
      dispatch(enableBiometric());

      showToast({
        type: 'success',
        title: t('messages.success'),
        message: t('biometric.enabledSuccess'),
      });
    } catch (error) {
      if (error instanceof BiometricError) {
        if (error.code !== 'CANCELLED') {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message: error.message,
          });
        }
      } else {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: t('messages.somethingWentWrong'),
        });
      }
    } finally {
      resolvePrompt();
    }
  }, [dispatch, resolvePrompt, t]);

  const handleMaybeLater = useCallback(() => {
    resolvePrompt();
  }, [resolvePrompt]);

  const value = useMemo(
    () => ({ promptBiometricSetup }),
    [promptBiometricSetup],
  );

  return (
    <BiometricSetupContext.Provider value={value}>
      {children}
      <BiometricSetupModal
        visible={visible}
        isLoading={isEnabling}
        onEnable={handleEnable}
        onMaybeLater={handleMaybeLater}
      />
    </BiometricSetupContext.Provider>
  );
}

export function useBiometricSetup(): BiometricSetupContextValue {
  const context = useContext(BiometricSetupContext);

  if (!context) {
    throw new Error('useBiometricSetup must be used within BiometricSetupProvider');
  }

  return context;
}
