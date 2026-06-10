import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { logout } from '@store/slices/authSlice';
import { resetAndNavigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { isGuestUser } from '@utils/guest/guestAuth';

export function useGuestGuard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isGuest = useAppSelector(state =>
    isGuestUser(state.auth.userDetails, state.auth.isGuest),
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const promptLogin = useCallback(
    (message?: string) => {
      setModalMessage(message || t('guest.loginRequiredMessage'));
      setModalVisible(true);
    },
    [t],
  );

  const requireFullAccount = useCallback(
    (action?: () => void, message?: string) => {
      if (!isGuest) {
        action?.();
        return true;
      }
      promptLogin(message);
      return false;
    },
    [isGuest, promptLogin],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const goToLogin = useCallback(() => {
    setModalVisible(false);
    dispatch(logout());
    resetAndNavigate(SCREEN_NAMES.LOGIN);
  }, [dispatch]);

  return {
    isGuest,
    modalVisible,
    modalMessage,
    promptLogin,
    requireFullAccount,
    closeModal,
    goToLogin,
  };
}
