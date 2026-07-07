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
  finishBiometricSetupFlow: () => void;
}

const BiometricSetupContext = createContext<BiometricSetupContextValue | null>(null);

type BiometricPendingAction = 'enable' | 'later';

export function BiometricSetupProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<BiometricPendingAction | null>(null);
  const resolverRef = useRef<(() => void) | null>(null);

  const finishBiometricSetupFlow = useCallback(() => {
    setVisible(false);
    setIsEnabling(false);
    setIsRedirecting(false);
    setPendingAction(null);
  }, []);

  const completeUserChoice = useCallback((action: BiometricPendingAction) => {
    setIsEnabling(false);
    setPendingAction(action);
    setIsRedirecting(true);
    resolverRef.current?.();
    resolverRef.current = null;
  }, []);

  const promptBiometricSetup = useCallback(() => {
    return new Promise<void>(resolve => {
      resolverRef.current = resolve;
      setVisible(true);
      setIsEnabling(false);
      setIsRedirecting(false);
      setPendingAction(null);
    });
  }, []);

  const handleEnable = useCallback(async () => {
    if (isEnabling || isRedirecting) return;
    setIsEnabling(true);

    try {
      const { available } = await checkBiometricAvailability();

      if (!available) {
        showToast({
          type: 'error',
          title: t('messages.error'),
          message: t('biometric.notAvailable'),
        });
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
      completeUserChoice('enable');
    }
  }, [completeUserChoice, dispatch, isEnabling, isRedirecting, t]);

  const handleMaybeLater = useCallback(() => {
    if (isEnabling || isRedirecting) return;
    completeUserChoice('later');
  }, [completeUserChoice, isEnabling, isRedirecting]);

  const value = useMemo(
    () => ({ promptBiometricSetup, finishBiometricSetupFlow }),
    [promptBiometricSetup, finishBiometricSetupFlow],
  );

  return (
    <BiometricSetupContext.Provider value={value}>
      {children}
      <BiometricSetupModal
        visible={visible}
        isEnabling={isEnabling}
        isRedirecting={isRedirecting}
        pendingAction={pendingAction}
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
