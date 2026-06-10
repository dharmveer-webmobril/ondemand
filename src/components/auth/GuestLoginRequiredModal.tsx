import { SweetAlert } from '@components/common';
import { useTranslation } from 'react-i18next';

type GuestLoginRequiredModalProps = {
  visible: boolean;
  message?: string;
  onClose: () => void;
  onLogin: () => void;
};

export default function GuestLoginRequiredModal({
  visible,
  message,
  onClose,
  onLogin,
}: GuestLoginRequiredModalProps) {
  const { t } = useTranslation();

  return (
    <SweetAlert
      visible={visible}
      message={message || t('guest.loginRequiredMessage')}
      isConfirmType="confirm"
      onCancel={onClose}
      onOk={onLogin}
    />
  );
}
