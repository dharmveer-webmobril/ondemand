import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SelectOptionModal, { OptionItem } from '@components/common/SelectOptionModal';

type ServiceFor = 'self' | 'other';

type ServiceForModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (serviceFor: ServiceFor) => void;
  selectedServiceFor?: ServiceFor;
};

export default function ServiceForModal({
  visible,
  onClose,
  onConfirm,
  selectedServiceFor = 'self',
}: ServiceForModalProps) {
  const { t } = useTranslation();

  const serviceForOptions: OptionItem[] = useMemo(
    () => [
      {
        id: 'self',
        label: t('checkout.self'),
        icon: 'person',
        iconType: 'Ionicons',
      },
      {
        id: 'other',
        label: t('checkout.other'),
        icon: 'people',
        iconType: 'Ionicons',
      },
    ],
    [t],
  );

  return (
    <SelectOptionModal
      visible={visible}
      onClose={onClose}
      onConfirm={selectedId => onConfirm(selectedId as ServiceFor)}
      title={t('checkout.selectServiceFor')}
      options={serviceForOptions}
      selectedValue={selectedServiceFor}
      showCloseButton={true}
      selectionType="radio"
    />
  );
}
